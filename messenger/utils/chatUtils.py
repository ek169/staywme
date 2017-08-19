from ..models import Message
import logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)


def getChatMessageJson(user_id, chat_list):
    json_chatlist = []
    for chat in chat_list:
        other_user = []
        if chat.user_one.user_id == user_id:
            other_user = chat.user_two.as_json()
        elif chat.user_two.user_id == user_id:
            other_user = chat.user_one.as_json()
        messages = Message.objs.filter(chat=chat).order_by('created')
        messages_arr = []
        for m in messages:
            messages_arr.append(dict(sender=m.sender,
                                     message=m.message,
                                     created=m.created))

        last_sender_id = 0
        if len(messages_arr) > 0:
            last_sender_id = messages_arr[len(messages_arr)-1]['sender']

        json_chatlist.append(dict(id=chat.id,
                                  new_message=chat.new_message,
                                  updated=chat.updated,
                                  lastSenderId=last_sender_id,
                                  otherUser=other_user,
                                  messages=messages_arr))
    return json_chatlist


