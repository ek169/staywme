from ..models import Message
import logging
logging.basicConfig(filename='example.log',level=logging.DEBUG)


def getChatMessageJson(user_id, chat_list):
    json_chatlist = []
    for chat in chat_list:
        other_user_name = ""
        other_user_pic = ""
        other_user_id = 0
        if chat.user_one.user_id == user_id:
            other_user_name = chat.user_two.name
            other_user_pic = chat.user_two.picture_url
            other_user_id = chat.user_two.user_id
        elif chat.user_two.user_id == user_id:
            other_user_name = chat.user_one.name
            other_user_pic = chat.user_one.picture_url
            other_user_id = chat.user_one.user_id
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
                                  lastSenderId=last_sender_id,
                                  otherUser=other_user_name,
                                  otherUserPic=other_user_pic,
                                  otherUserId=other_user_id,
                                  messages=messages_arr))
    return json_chatlist


