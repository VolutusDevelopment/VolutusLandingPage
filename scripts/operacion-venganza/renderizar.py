#!/usr/bin/env python3
"""Renderiza las tiras de Operación Venganza, varias a la vez.

Corre con Node, desde la raíz del repo, los `sprites.mjs` de las escenas (en
el orden del juego), los de combate y los de las pantallas de carga. Cada
escena se reparte en tantas partes como procesos (TOMAS_PARTE, ver tiras.mjs),
y los procesos se van llenando con las partes que faltan. El registro sube y
la barra de progreso queda fija en la última fila.

    python3 scripts/operacion-venganza/renderizar.py                  # todo
    python3 scripts/operacion-venganza/renderizar.py escena2 combate  # solo eso
    python3 scripts/operacion-venganza/renderizar.py -j 4             # 4 a la vez

Las imágenes se escriben en public/operacion-venganza y se commitean; el build
no las genera (ver scripts/operacion-venganza/tiras.mjs).
"""

from __future__ import annotations

import argparse
import os
import queue
import shutil
import signal
import subprocess
import sys
import threading
import time
from collections import deque
from dataclasses import dataclass
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SCRIPTS = RAIZ / "scripts/operacion-venganza"
OTROS = ["combate/sprites.mjs", "combate/pasadas.mjs", "combate/retratos.mjs", "cargas/sprites.mjs"]


@dataclass
class Trabajo:
    """Un proceso de Node: un script entero, o una parte de una escena."""

    grupo: str
    script: Path
    parte: str | None = None
    proceso: subprocess.Popen | None = None
    inicio: float = 0.0
    tiras: int = 0
    escritas: int = 0

    @property
    def nombre(self) -> str:
        return f"{self.grupo} {self.parte}" if self.parte else self.grupo


def grupo(script: Path) -> str:
    """`escena2`, `combate`, `combate/pasadas`…: el nombre con que se pide."""
    carpeta = script.parent.name
    return carpeta if script.name == "sprites.mjs" else f"{carpeta}/{script.stem}"


def coincide(script: Path, pedido: str) -> bool:
    """`combate` pide los tres de combate; `escena1`, solo la escena 1."""
    return grupo(script) == pedido or grupo(script).startswith(f"{pedido}/")


def trabajos(pedidos: list[str], partes: int) -> list[Trabajo]:
    """Las partes de cada escena y los demás scripts; solo los `pedidos`, si hay."""
    escenas = sorted(SCRIPTS.glob("escena*/sprites.mjs"), key=lambda ruta: int(ruta.parent.name.removeprefix("escena")))
    scripts = [*escenas, *(SCRIPTS / ruta for ruta in OTROS)]
    desconocidos = [pedido for pedido in pedidos if not any(coincide(script, pedido) for script in scripts)]
    if desconocidos:
        sys.exit(f"No conozco {', '.join(desconocidos)}. Hay: {', '.join(dict.fromkeys(grupo(s).split('/')[0] for s in scripts))}.")
    lista = []
    for script in scripts:
        if pedidos and not any(coincide(script, pedido) for pedido in pedidos):
            continue
        if script in escenas:
            lista += [Trabajo(grupo(script), script, f"{k}/{partes}") for k in range(1, partes + 1)]
        else:
            lista.append(Trabajo(grupo(script), script))
    return lista


def reloj(segundos: float) -> str:
    segundos = int(segundos)
    return f"{segundos // 60:02d}:{segundos % 60:02d}"


class Pantalla:
    """El registro sube por la terminal y la barra no se mueve del pie."""

    def __init__(self, total: int):
        self.total = total
        self.hechos = 0
        self.imagenes = 0
        self.fallos: list[str] = []
        self.abortado = False
        self.corriendo: list[Trabajo] = []
        self.inicio = time.monotonic()
        self.dibujada = ""
        self.fijo = sys.stdout.isatty()
        self.columnas, self.filas = 0, 0
        if self.fijo:
            sys.stdout.write("\033[?25l\033[2J\033[H")
            self._ajustar()

    def _ajustar(self) -> bool:
        """Rehace la región del registro si cambió el tamaño; False si no hay barra."""
        if not self.fijo:
            return False
        columnas, filas = shutil.get_terminal_size((100, 24))
        if filas < 6 or columnas < 40:
            self.fijo = False
            sys.stdout.write("\033[r\033[?25h")
            return False
        if (columnas, filas) != (self.columnas, self.filas):
            self.columnas, self.filas = columnas, filas
            self.dibujada = ""
            sys.stdout.write(f"\033[r\033[1;{filas - 1}r")
        return True

    def _linea(self) -> str:
        # Los que corren suman lo que llevan de sus tiras (las cuentan al empezar).
        avance = (self.hechos + sum(min(1, t.escritas / t.tiras) for t in self.corriendo if t.tiras)) / self.total
        final = f" {self.hechos}/{self.total} {int(avance * 100):>3}% {reloj(time.monotonic() - self.inicio)}"
        grupos = ", ".join(dict.fromkeys(trabajo.grupo for trabajo in self.corriendo)) or "listo"
        etiqueta = f"▶ {grupos}"[:28].ljust(28) if self.columnas >= 56 else ""
        ancho = self.columnas - len(etiqueta) - len(final) - 1
        llenos = round(ancho * avance)
        if "NO_COLOR" in os.environ:
            return f"{etiqueta}{'█' * llenos}{'░' * (ancho - llenos)}{final}"
        color = "31" if self.fallos or self.abortado else "32" if self.hechos == self.total else "36"
        return f"{etiqueta}\033[{color}m{'█' * llenos}\033[2m{'░' * (ancho - llenos)}\033[0m{final}"

    def dibujar(self) -> None:
        """Rehace la barra, solo si cambió (el reloj avanza de a un segundo)."""
        if not self._ajustar():
            return
        linea = self._linea()
        if linea != self.dibujada:
            self.dibujada = linea
            sys.stdout.write(f"\033[{self.filas};1H\033[2K{linea}")
            sys.stdout.flush()

    def log(self, texto: str = "") -> None:
        if not self._ajustar():
            print(texto, flush=True)
            return
        sys.stdout.write(f"\033[{self.filas - 1};1H\033[2K{texto[: self.columnas - 1]}\n")
        self.dibujar()

    def sello(self) -> str:
        return f"[{reloj(time.monotonic() - self.inicio)}]"

    def cerrar(self) -> None:
        if self.fijo:
            self.dibujar()
            sys.stdout.write("\033[r\033[?25h\n")
            sys.stdout.flush()


def lanzar(trabajo: Trabajo, salida: queue.Queue) -> None:
    """Arranca el script y pasa sus líneas a `salida`; None cuando termina."""
    entorno = {**os.environ, "TOMAS_PARTE": trabajo.parte} if trabajo.parte else None
    trabajo.inicio = time.monotonic()
    trabajo.proceso = subprocess.Popen(
        ["node", str(trabajo.script)],
        cwd=RAIZ,
        env=entorno,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        start_new_session=True,
    )

    def leer() -> None:
        try:
            for linea in trabajo.proceso.stdout:
                salida.put((trabajo, linea.strip()))
        finally:
            salida.put((trabajo, None))

    threading.Thread(target=leer, daemon=True).start()


def detener(trabajos: list[Trabajo]) -> None:
    """Termina los scripts y lo que lanzaron (su Chromium), todos a la vez."""
    vivos = [t.proceso for t in trabajos if t.proceso and t.proceso.poll() is None]
    for senal in (signal.SIGTERM, signal.SIGKILL):
        for proceso in vivos:
            try:
                os.killpg(proceso.pid, senal)
            except ProcessLookupError:
                pass
        limite = time.monotonic() + 5
        for proceso in vivos:
            try:
                proceso.wait(timeout=max(0, limite - time.monotonic()))
            except subprocess.TimeoutExpired:
                pass
        vivos = [proceso for proceso in vivos if proceso.poll() is None]
        if not vivos:
            return


def correr(lista: list[Trabajo], procesos: int, pantalla: Pantalla) -> None:
    pendientes = deque(lista)
    salida: queue.Queue = queue.Queue()
    try:
        while pendientes or pantalla.corriendo:
            while pendientes and len(pantalla.corriendo) < procesos:
                # A la lista antes de lanzarlo: si llega Ctrl+C, detener() lo encuentra.
                trabajo = pendientes.popleft()
                pantalla.corriendo.append(trabajo)
                lanzar(trabajo, salida)
            try:
                trabajo, linea = salida.get(timeout=0.2)
            except queue.Empty:
                pantalla.dibujar()
                continue
            if linea is not None:
                if linea.startswith("tiras: "):
                    trabajo.tiras = int(linea.removeprefix("tiras: "))
                    continue
                if linea.startswith("sprites: "):
                    trabajo.escritas += 1
                    pantalla.imagenes += 1
                if linea:
                    pantalla.log(f"{pantalla.sello()}   {trabajo.nombre}: {linea}")
                continue
            codigo = trabajo.proceso.wait()
            segundos = time.monotonic() - trabajo.inicio
            pantalla.corriendo.remove(trabajo)
            pantalla.hechos += 1
            if codigo == 0:
                pantalla.log(f"{pantalla.sello()} ✓ {trabajo.nombre} ({segundos:.1f} s)")
            else:
                pantalla.fallos.append(trabajo.nombre)
                pantalla.log(f"{pantalla.sello()} ✗ {trabajo.nombre} (código {codigo}, {segundos:.1f} s)")
    finally:
        detener(pantalla.corriendo)


def main() -> int:
    nucleos = os.cpu_count() or 1
    argumentos = argparse.ArgumentParser(description="Renderiza las tiras de Operación Venganza.")
    argumentos.add_argument("pedidos", nargs="*", metavar="nombre", help="solo estas escenas o scripts: escena2, combate, combate/pasadas, cargas…")
    argumentos.add_argument("-j", "--procesos", type=int, default=nucleos, help=f"procesos a la vez (por defecto {nucleos}, uno por núcleo)")
    args = argumentos.parse_args()
    if args.procesos < 1:
        argumentos.error("-j tiene que ser 1 o más")
    if shutil.which("node") is None:
        sys.exit("No encontré `node` en el PATH.")
    lista = trabajos(args.pedidos, args.procesos)

    # Que cerrar la terminal o un kill paren todo igual que Ctrl+C.
    for senal in (signal.SIGTERM, signal.SIGHUP):
        signal.signal(senal, signal.default_int_handler)
    pantalla = Pantalla(len(lista))
    interrumpido = False
    try:
        correr(lista, args.procesos, pantalla)
    except KeyboardInterrupt:
        interrumpido = pantalla.abortado = True
        pantalla.log(f"{pantalla.sello()} ✗ interrumpido")
    finally:
        resumen = f"{pantalla.hechos}/{pantalla.total} procesos, {pantalla.imagenes} imágenes, {time.monotonic() - pantalla.inicio:.1f} s."
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
