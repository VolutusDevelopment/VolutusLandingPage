#!/usr/bin/env python3
"""Renderiza todas las tiras de Operación Venganza, una tras otra.

Reúne los `sprites.mjs` de las escenas (en el orden del juego), los de combate
y los de las pantallas de carga, y los corre con Node desde la raíz del repo.
El registro sube y la barra de progreso queda fija en la última fila.

    python3 scripts/operacion-venganza/renderizar.py

Las imágenes se escriben en public/operacion-venganza y se commitean; el build
no las genera (ver scripts/operacion-venganza/tiras.mjs).
"""

from __future__ import annotations

import os
import queue
import shutil
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPTS = RAIZ / "scripts/operacion-venganza"


def comandos() -> list[Path]:
    """Los `sprites.mjs` de todas las escenas, y los de combate y cargas."""
    escenas = sorted(SCRIPTS.glob("escena*/sprites.mjs"), key=lambda ruta: int(ruta.parent.name.removeprefix("escena")))
    return [
        *escenas,
        SCRIPTS / "combate/sprites.mjs",
        SCRIPTS / "combate/pasadas.mjs",
        SCRIPTS / "combate/retratos.mjs",
        SCRIPTS / "cargas/sprites.mjs",
    ]


COMANDOS = comandos()


class Pantalla:
    """El registro sube por la terminal y la barra no se mueve del pie."""

    def __init__(self, total: int):
        self.total = total
        self.hechos = 0
        self.archivos = 0
        self.fallos: list[str] = []
        self.abortado = False
        self.actual = "preparando"
        self.inicio = time.monotonic()
        self.tty = sys.stdout.isatty()
        self.fijo = False
        self.columnas, self.filas = 0, 0
        if self.tty:
            self.columnas, self.filas = shutil.get_terminal_size((100, 24))
            if self.filas >= 6:
                self.fijo = True
                sys.stdout.write("\033[?25l\033[2J\033[H")
                self._region()
                sys.stdout.flush()

    def _region(self) -> None:
        sys.stdout.write(f"\033[1;{self.filas - 1}r")

    def _ajustar(self) -> bool:
        """Rehace la región si cambió el tamaño; False si no cabe la barra."""
        if not self.fijo:
            return False
        columnas, filas = shutil.get_terminal_size((100, 24))
        if filas < 6:
            self.fijo = False
            sys.stdout.write("\033[r")
            return False
        if (columnas, filas) != (self.columnas, self.filas):
            self.columnas, self.filas = columnas, filas
            sys.stdout.write("\033[r")
            self._region()
        return True

    def _linea(self) -> str:
        segundos = int(time.monotonic() - self.inicio)
        reloj = f"{segundos // 60:02d}:{segundos % 60:02d}"
        cuenta = f"{self.hechos}/{self.total} {self.hechos * 100 // self.total:>3}%"
        final = f" {cuenta} {reloj}"
        etiqueta = f"▶ {self.actual}"[:28].ljust(28) if self.columnas >= 56 else ""
        ancho = max(10, self.columnas - len(etiqueta) - len(final) - 1)
        llenos = round(ancho * self.hechos / self.total)
        color = "\033[31m" if self.fallos or self.abortado else "\033[32m" if self.hechos == self.total else "\033[36m"
        color = color if "NO_COLOR" not in os.environ else ""
        barra = f"{color}{'█' * llenos}\033[2m{'░' * (ancho - llenos)}\033[0m" if color else "█" * llenos + "░" * (ancho - llenos)
        return f"{etiqueta}{barra}{final}"

    def dibujar(self) -> None:
        if not self._ajustar():
            return
        sys.stdout.write(f"\033[{self.filas};1H\033[2K{self._linea()}")
        sys.stdout.flush()

    def log(self, texto: str = "") -> None:
        if not self._ajustar():
            print(texto)
            return
        sys.stdout.write(f"\033[{self.filas - 1};1H\033[2K{texto}\n")
        self.dibujar()

    def sello(self) -> str:
        segundos = int(time.monotonic() - self.inicio)
        return f"[{segundos // 60:02d}:{segundos % 60:02d}]"

    def cerrar(self) -> None:
        if not self.tty:
            return
        if self.fijo:
            self.dibujar()
        sys.stdout.write("\033[r\033[?25h\n")
        sys.stdout.flush()


def matar(proceso: subprocess.Popen) -> None:
    """Termina el script y todo lo que haya lanzado (el Chromium de la GPU)."""
    if proceso.poll() is not None:
        return
    try:
        os.killpg(proceso.pid, signal.SIGTERM)
    except (AttributeError, ProcessLookupError, PermissionError):
        proceso.terminate()
    try:
        proceso.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proceso.pid, signal.SIGKILL)
        except (AttributeError, ProcessLookupError, PermissionError):
            proceso.kill()
        proceso.wait()


def ejecutar(script: Path, pantalla: Pantalla) -> tuple[int, float]:
    """Corre `script` y va pasando sus líneas al registro."""
    nombre = str(script.relative_to(SCRIPTS))
    pantalla.actual = nombre
    pantalla.dibujar()
    pantalla.log(f"{pantalla.sello()} ▶ {nombre}")
    inicio = time.monotonic()
    proceso = subprocess.Popen(
        ["node", str(script)],
        cwd=RAIZ,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        start_new_session=True,
    )
    lineas: queue.Queue[str | None] = queue.Queue()

    def leer() -> None:
        try:
            for linea in proceso.stdout:
                lineas.put(linea.rstrip("\n"))
        finally:
            lineas.put(None)

    threading.Thread(target=leer, daemon=True).start()
    try:
        while True:
            try:
                linea = lineas.get(timeout=0.2)
            except queue.Empty:
                pantalla.dibujar()
                continue
            if linea is None:
                break
            if linea.strip():
                pantalla.log(f"{pantalla.sello()}   {linea.strip()}")
                if linea.startswith("sprites: "):
                    pantalla.archivos += 1
        return proceso.wait(), time.monotonic() - inicio
    except BaseException:
        matar(proceso)
        raise


def main() -> int:
    if shutil.which("node") is None:
        sys.exit("No encontré `node` en el PATH.")
    faltan = [str(script.relative_to(RAIZ)) for script in COMANDOS if not script.is_file()]
    if faltan:
        sys.exit("Faltan scripts:\n  " + "\n  ".join(faltan))

    pantalla = Pantalla(len(COMANDOS))
    interrumpido = False
    try:
        for numero, script in enumerate(COMANDOS, 1):
            codigo, segundos = ejecutar(script, pantalla)
            pantalla.hechos = numero
            nombre = str(script.relative_to(SCRIPTS))
            if codigo == 0:
                pantalla.log(f"{pantalla.sello()} ✓ {nombre} ({segundos:.1f} s)")
            else:
                pantalla.fallos.append(nombre)
                pantalla.log(f"{pantalla.sello()} ✗ {nombre} (código {codigo}, {segundos:.1f} s)")
            pantalla.dibujar()
    except KeyboardInterrupt:
        interrumpido = True
        pantalla.abortado = True
        pantalla.log(f"{pantalla.sello()} ✗ interrumpido")
    finally:
        total = time.monotonic() - pantalla.inicio
        resumen = f"{pantalla.hechos}/{pantalla.total} scripts, {pantalla.archivos} imágenes, {total:.1f} s."
        pantalla.log("")
        if interrumpido:
            pantalla.log(f"Interrumpido: {resumen}")
        elif pantalla.fallos:
            pantalla.log(f"Terminado con fallos: {resumen}")
            pantalla.log(f"Fallaron: {', '.join(pantalla.fallos)}")
        else:
            pantalla.log(f"Listo: {resumen}")
        pantalla.cerrar()
    return 130 if interrumpido else 1 if pantalla.fallos else 0


if __name__ == "__main__":
    sys.exit(main())
