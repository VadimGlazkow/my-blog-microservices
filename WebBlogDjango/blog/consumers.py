import json
from channels.generic.websocket import AsyncWebsocketConsumer


class PostConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.post_id = self.scope['url_route']['kwargs']['post_id']
        self.group_name = f'post_{self.post_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        pass

    async def post_update(self, event):
        await self.send(text_data=json.dumps({
            'likes_count': event['likes_count'],
            'dislikes_count': event['dislikes_count'],
            'user_liked': event['user_liked'],
            'user_disliked': event['user_disliked'],
        }))
