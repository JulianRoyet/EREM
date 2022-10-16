# FIXME: LEGACY until v0.3
import warnings
warnings.warn("talon_plugins.speech has been removed, please remove it from your imports. Use actions.speech.toggle() instead of speech.set_enabled()", DeprecationWarning)

from talon import actions
def set_enabled(state: bool) -> None:
    warnings.warn("Use actions.speech.toggle() instead of speech.set_enabled()", DeprecationWarning, stacklevel=1)
    actions.speech.toggle(state)
