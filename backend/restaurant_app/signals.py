from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Restaurant, RestaurantPrintSettings
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order, ParcelOrder


@receiver(post_save, sender=Restaurant)
def create_print_settings(sender, instance, created, **kwargs):
    if created:
        RestaurantPrintSettings.objects.create(
            restaurant=instance
        )



@receiver(post_save, sender=Order)
def broadcast_order_to_kitchen(sender, instance, created, **kwargs):
    """Broadcast new orders to kitchen dashboard via WebSocket"""
    if not created:
        return
    
    # Only broadcast if order is for active session
    if instance.session.status != 'active':
        return

    channel_layer = get_channel_layer()
    restaurant_id = None
    
    # Get restaurant from session
    if instance.session.table:
        restaurant_id = str(instance.session.table.restaurant.id)
    elif instance.session.table_group:
        restaurant_id = str(instance.session.table_group.restaurant.id)
    
    if not restaurant_id:
        return

    # Prepare order data
    order_data = {
        'id': str(instance.id),
        'session_id': str(instance.session.id),
        'status': instance.status,
        'order_source': instance.order_source,
        'total': str(instance.total),
        'special_instructions': instance.special_instructions,
        'created_at': instance.created_at.isoformat(),
        'table_number': None,
        'customer_name': instance.session.customer_name or 'Guest',
        'is_first_order': instance.session.orders.count() == 1,
        'items': []
    }

    # Add table/group info
    if instance.session.table:
        order_data['table_number'] = instance.session.table.table_number
    elif instance.session.table_group:
        order_data['table_number'] = f"Group"
        order_data['group_tables'] = [
            t.table_number for t in instance.session.table_group.tables.all()
        ]

    # Add items
    for item in instance.items.all():
        order_data['items'].append({
            'id': str(item.id),
            'name': item.menu_item.name,
            'quantity': item.quantity,
            'is_half': item.is_half,
            'price': str(item.price),
            'completed': False
        })

    # Broadcast to kitchen group
    async_to_sync(channel_layer.group_send)(
        f'kitchen_{restaurant_id}',
        {
            'type': 'kitchen_order_update',
            'order': order_data,
            'message': 'New order received'
        }
    )


@receiver(post_save, sender=ParcelOrder)
def broadcast_parcel_to_kitchen(sender, instance, created, **kwargs):
    """Broadcast accepted parcel orders to kitchen"""
    if not created:
        return
    
    # Only broadcast if status is 'accepted' (owner accepted it)
    if instance.status != 'accepted':
        return

    channel_layer = get_channel_layer()
    restaurant_id = str(instance.restaurant.id)

    parcel_data = {
        'id': str(instance.id),
        'type': 'parcel',
        'customer_name': instance.customer_name,
        'customer_phone': instance.customer_phone,
        'total': str(instance.total),
        'status': instance.status,
        'created_at': instance.created_at.isoformat(),
        'items': []
    }

    for item in instance.items.all():
        parcel_data['items'].append({
            'id': str(item.id),
            'name': item.menu_item.name,
            'quantity': item.quantity,
            'price': str(item.price),
            'completed': False
        })

    async_to_sync(channel_layer.group_send)(
        f'kitchen_{restaurant_id}',
        {
            'type': 'kitchen_order_update',
            'order': parcel_data,
            'message': 'New parcel order accepted'
        }
    )