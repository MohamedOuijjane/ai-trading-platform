from django import template

register = template.Library()

ICON_MAP = {
    'trade':       ('📈', 'yellow'),
    'prediction':  ('👤', 'purple'),
    'botconfig':   ('🛒', 'green'),
    'marketprice': ('📄', 'blue'),
    'portfolio':   ('💼', 'teal'),
    'user':        ('👤', 'purple'),
    'group':       ('👥', 'blue'),
}

@register.filter
def model_icon(object_name):
    key = object_name.lower()
    for k, (icon, _) in ICON_MAP.items():
        if k in key:
            return icon
    return '📦'

@register.filter
def model_icon_class(object_name):
    key = object_name.lower()
    for k, (_, cls) in ICON_MAP.items():
        if k in key:
            return cls
    return 'blue'