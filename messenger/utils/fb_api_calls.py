import hashlib
import hmac
import logging
import requests
import json
logging.basicConfig(filename='example.log', level=logging.DEBUG)

def get_page_data(user_id, access_token):
    app_secret = 'd53e7ea77a5abb591755aa62b74beb10'
    appsecret_proof = hmac.new(key=app_secret.encode('ascii'), msg=access_token.encode('ascii'), digestmod=hashlib.sha256).hexdigest()
    api_endpoint = "https://graph.facebook.com/v2.9/" + str(user_id) +"?appsecret_proof=" + str(appsecret_proof) \
    + "&access_token=" + str(access_token) + "&fields=context.fields%28mutual_friends.fields%28picture.width%2840%29.height%2840%29%29%29"


    try:
        response = requests.request("GET", api_endpoint)
        json_response = json.loads(response.text)

        try:
            mutual_friends = json_response['context']['mutual_friends']
            return mutual_friends
        except (ValueError, KeyError, TypeError):
            return "JSON error"

    except IOError, e:
        if hasattr(e, 'code'):
            return e.code
        elif hasattr(e, 'reason'):
            return e.reason