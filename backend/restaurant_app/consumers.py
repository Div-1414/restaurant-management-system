from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json


class OrderConsumer(AsyncJsonWebsocketConsumer):
    """
    Existing consumer for general restaurant updates
    Used for: table updates, general order notifications
    """
    async def connect(self):
        self.restaurant_id = self.scope['url_route']['kwargs']['restaurant_id']
        self.room_group_name = f'restaurant_{self.restaurant_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'order_update',
                'message': content
            }
        )

    async def order_update(self, event):
        await self.send_json(event['message'])

    async def table_update(self, event):
        await self.send_json(event['message'])


class KitchenConsumer(AsyncJsonWebsocketConsumer):
    """
    NEW: Dedicated consumer for kitchen dashboard
    Used for: real-time kitchen order notifications
    """
    async def connect(self):
        self.restaurant_id = self.scope['url_route']['kwargs']['restaurant_id']
        self.room_group_name = f'kitchen_{self.restaurant_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive_json(self, content):
        # Handle any messages from kitchen client if needed
        pass

    async def kitchen_order_update(self, event):
        """
        Handler for kitchen-specific order updates
        Sends order data with all required fields for UI display
        """
        order_data = event.get('order', {})
        
        # Ensure the order data has the required fields for frontend display
        # If backend sends partial data, we ensure structure is consistent
        formatted_order = {
            'id': order_data.get('id'),
            'session_id': order_data.get('session_id'),
            'status': order_data.get('status', 'pending'),
            'order_source': order_data.get('order_source', 'qr'),
            'total': order_data.get('total', '0'),
            'special_instructions': order_data.get('special_instructions', ''),
            'created_at': order_data.get('created_at'),
            'table_number': order_data.get('table_number'),
            'table_group': order_data.get('table_group'),
            'customer_name': order_data.get('customer_name', 'Guest'),
            'restaurant_name': order_data.get('restaurant_name', ''),  # ✅ ADD
            'hall_name': order_data.get('hall_name', 'General'),  # ✅ ADD
            'is_first_order': order_data.get('is_first_order', False),
            'items': order_data.get('items', []),
            'group_tables': order_data.get('group_tables', [])
        }
        
        await self.send_json({
            'type': 'kitchen_order_update',
            'order': formatted_order,
            'message': event.get('message', '')
        })