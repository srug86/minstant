// code that is shared between client and server, i.e. sent to both

// method definitions
Meteor.methods({
	addChat:function(members){
		if (this.userId){
			// find a chat that has two users that match current user id
			// and the requested user id
			var filter = {$or:[
				{user1Id:members.myUserId, user2Id:members.otherUserId}, 
				{user1Id:members.otherUserId, user2Id:members.myUserId}
			]};
			var chat = Chats.findOne(filter);
			if (!chat){// no chat matching the filter - need to insert a new one
				return Chats.insert({
					user1Id:members.myUserId,
					user2Id:members.otherUserId,
					messages:[]
				});
			}
			else {// there is a chat going already - use that. 
				return chat._id;
			}
		}
		return;
	},
	// update chat status
	updateChat:function(chat){
		if (this.userId){// we have a user
			// update the chat object in the database.
			return Chats.update(chat._id, chat);
		}
		return;
	}
})
