from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MarketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "market_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # We don't expect client messages for now
        pass

    async def market_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
