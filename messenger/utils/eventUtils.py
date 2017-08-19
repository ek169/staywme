from datetime import date

import logging

logging.basicConfig(filename='example.log', level=logging.DEBUG)


def event_as_json(event, user_id):
    if event.user_one.user_id == user_id:
        other_user = event.user_two.simple_json()
    elif event.user_two.user_id == user_id:
        other_user = event.user_one.simple_json()
    if other_user:
        return dict(other_user=other_user, creator_id=event.creator_id, start_date=event.start_date,
                    end_date=event.end_date, id=event.id, response=event.response)

def get_all_requests(events, user_id):
    if len(events) > 0:
        now = date.today()
        event_types = {"inquiries": [], "events": []}
        for e in events:
            if e.creator_id != user_id and e.response is None:
                if e.start_date >= now:
                    event_types['inquiries'].append(event_as_json(e, user_id))
            elif e.creator_id != user_id and e.response is True:
                event_types['events'].append(event_as_json(e, user_id))
            elif e.creator_id == user_id:
                event_types['events'].append(event_as_json(e, user_id))
        return event_types

def get_public_requests(events, friend_id):
    if len(events) > 0:
        all_events = []
        for e in events:
            if e.response is True:
                all_events.append(event_as_json(e.as_json(), friend_id))
        return all_events



