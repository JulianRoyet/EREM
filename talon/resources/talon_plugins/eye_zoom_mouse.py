from typing import Optional
import math
import time

from .eye_mouse import tracker, mouse, sync_tracker
from .eye_mouse import config as eye_config
from talon import canvas, ctrl, metrics, screen, ui, tap
from talon.api import lib, ffi
from talon import noise
from talon.skia import Image
from talon.types import Rect, Point2d

class config:
    screen_area = Point2d(400, 300)
    img_scale = 3
    img_alpha = 0.9
    eye_avg = 20
    double_click = 0.25
    frames = 10
    live = False # FIXME: only works on mac for now, enable based on platform?

STATE_IDLE = 0
STATE_OVERLAY = 1

class ZoomMouse:
    state: int
    img: Optional[Image]
    handle_size: Point2d
    last_click: float
    enabled: bool
    rect: Rect
    canvas: Optional[canvas.Canvas]

    def __init__(self):
        self.state = STATE_IDLE
        self.img = None
        self.handle_size = Point2d(0, 0)
        self.last_click = 0
        self.enabled = False
        self.rect = Rect(0, 0, 0, 0)
        self.canvas = None

    def enable(self):
        if self.enabled: return
        noise.register('pop', self.on_pop)
        tap.register(tap.MCLICK|tap.HOOK, self.on_key)
        tap.register(tap.KEY|tap.HOOK, self.on_key)
        # app.register('overlay', self.draw_gaze)
        self.enabled = True
        metrics.set_feature("eye_zoom", True)

    def disable(self):
        if not self.enabled: return
        noise.unregister('pop', self.on_pop)
        tap.unregister(tap.MCLICK|tap.HOOK, self.on_key)
        tap.unregister(tap.KEY|tap.HOOK, self.on_key)
        # app.unregister('overlay', self.draw_gaze)
        self.enabled = False
        if self.canvas:
            self.canvas.unregister('draw', self.draw)
            self.canvas.close()
            self.canvas = None
        metrics.set_feature("eye_zoom", False)

    def on_key(self, e):
        if self.state == STATE_OVERLAY:
            if e.type == tap.KEY and e == 'esc' and e.down and not e.repeat:
                self.cancel()
                e.block()

    def on_click(self, e):
        if self.state == STATE_OVERLAY and e.type == tap.MCLICK:
            self.cancel()

    def capture(self):
        try:
            if self.canvas:
                self.canvas.allows_capture = False
                self.img = screen.capture_rect(self.rect)
                self.canvas.allows_capture = True
        except AttributeError:
            pass

    def cancel(self):
        self.state = STATE_IDLE
        ctrl.cursor_visible(True)
        if self.canvas:
            self.canvas.unregister('draw', self.draw)
            self.canvas.close()
            self.canvas = None

    def on_pop(self, state):
        if len(mouse.eye_hist) < 2:
            return
        now = time.time()
        if self.state == STATE_IDLE:
            if now - self.last_click < config.double_click:
                ctrl.mouse_click(hold=32000)
                return

            l, r = mouse.eye_hist[-1]
            p = (l.gaze + r.gaze) / 2
            main_gaze = -0.02 < p.x < 1.02 and -0.02 < p.y < 1.02 and bool(l or r)
            if not main_gaze:
                pass # return

            ctrl.cursor_visible(False)

            self.size = config.screen_area * config.img_scale
            screen_rect  = eye_config.rect
            screen_valid = Rect(*screen_rect.pos, *(screen_rect.size - config.screen_area))
            scale_valid  = Rect(*screen_rect.pos, *(screen_rect.size - self.size))

            self.gaze = screen_rect.pos + screen_rect.size * p
            capture = screen_valid.clamp(self.gaze - (config.screen_area / 2))
            self.rect = Rect(*capture, *config.screen_area)
            self.pos = scale_valid.clamp(self.gaze - self.size / 2)
            self.off = Point2d(0, 0)

            self.frame = 0
            self.canvas = canvas.Canvas(*self.pos, *self.size)
            if not config.live:
                self.capture()
            self.canvas.register('draw', self.draw)
            self.state = STATE_OVERLAY
        elif self.state == STATE_OVERLAY:
            self.cancel()
            dot, origin = self.get_pos()
            if origin:
                ctrl.mouse_move(origin.x, origin.y)
                ctrl.mouse_click(hold=32000)
                self.last_click = time.time()

    def get_pos(self):
        dot = Point2d(0, 0)
        hist = mouse.eye_hist[-config.eye_avg:]
        for l, r in hist:
            dot += (l.gaze + r.gaze) / 2
        dot /= len(hist)
        rect = eye_config.rect
        dot = rect.pos + rect.size * dot

        off = dot - (self.pos - self.off)
        img = self.img
        if img:
            origin = img.rect.pos + off / config.img_scale
            if img.rect.contains(origin.x, origin.y):
                return dot, origin
        return None, None

    def draw(self, canvas):
        if not self.canvas:
            return False
        if config.live and self.rect:
            self.capture()
        self.frame += 1
        if self.frame < config.frames:
            t = ((self.frame + 1) / config.frames) ** 2

            anim_pos_from = self.rect.pos
            anim_pos_to = canvas.rect.pos
            anim_size_from = config.screen_area
            anim_size_to = canvas.rect.size

            pos = anim_pos_from + (anim_pos_to - anim_pos_from) * t
            size = anim_size_from + (anim_size_to - anim_size_from) * t

            dst = Rect(*pos, *size)
        elif self.frame == config.frames:
            # self.canvas.panel = True
            dst = canvas.rect.copy()
        else:
            dst = canvas.rect.copy()
        if not self.img:
            return
        src = Rect(0, 0, self.img.width, self.img.height)
        canvas.draw_image_rect(self.img, src, dst)

        dot, origin = self.get_pos()
        if not dot: return
        paint = canvas.paint
        paint.style = paint.Style.FILL
        paint.color = 'ffffff'
        canvas.draw_circle(dot.x, dot.y, config.img_scale + 1)
        # canvas.draw_circle(origin.x, origin.y, 2)
        paint.color = '000000'
        canvas.draw_circle(dot.x, dot.y, config.img_scale)
        # canvas.draw_circle(origin.x, origin.y, 1)
        ctrl.mouse_move(origin.x, origin.y)

zoom_mouse = ZoomMouse()

def on_screen_change(screens):
    if zoom_mouse.enabled and zoom_mouse.state != STATE_IDLE:
        zoom_mouse.disable()
        zoom_mouse.enable()
ui.register('screen_change', on_screen_change)

def toggle_zoom_mouse(state):
    if state:
        zoom_mouse.enable()
    else:
        zoom_mouse.disable()
    sync_tracker()
