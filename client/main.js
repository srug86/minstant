// code that is only sent to the client

// subscribe to read data
Meteor.subscribe("users");
Meteor.subscribe("chats");

// set up the main template the the router will use to build pages
Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

// specify the top level route, the page users see when they arrive at the site
Router.route('/', function () {
	console.log("rendering root /");
	this.render("navbar", {to:"header"});
	this.render("lobby_page", {to:"main"});	
});

// specify a route that allows the current user to chat to another users
Router.route('/chat/:_id', function () {
	// the user they want to chat to has id equal to 
	// the id sent in after /chat/...
	if (!Meteor.user()){// user not available
		alert("You need to login first!");
	}
	else {
		var members = {myUserId:Meteor.userId(),otherUserId:this.params._id};
		var id = Meteor.call("addChat", members,
		function(err, chatId){
			if (!err){// all good
				Session.set("chatId", chatId);
			}
		});
	}
	this.render("navbar", {to:"header"});
	this.render("chat_page", {to:"main"});  
});

///
// helper functions 
/// 
Template.available_user_list.helpers({
	users:function(){
		return Meteor.users.find();
	}
})

Template.available_user.helpers({
	getUserName:function(userId){
		return getUserName(userId);
	}, 
	isMyUser:function(userId){
		return isMyUser(userId);
	}
})

Template.chat_page.helpers({
	messages:function(){
		var chat = Chats.findOne({_id:Session.get("chatId")});
		return chat.messages;
	},
	getOtherName:function(){
		var userId = Meteor.userId();
		var chat = Chats.findOne({_id:Session.get("chatId")});
		if (chat) {
			var user1Id = chat.user1Id;
			var user2Id = chat.user2Id;
			if (userId == user1Id) {
				return getUserName(user2Id);
			}
			return getUserName(user1Id);
		}
		return;
	}
})

Template.chat_message.helpers({
	getUserName:function(userId){
		if (isMyUser(userId)) {
			return "You";
		}
		else {
			return getUserName(userId);
		}
	},
	isMyUser:function(userId){
		return isMyUser(userId);
	},
	getUserAvatar:function(userId){
		return getUserAvatar(userId);
	}
})

///
// event functions
///
Template.chat_page.events({
	// this event fires when the user sends a message on the chat page
	'submit .js-send-chat':function(event){
		// stop the form from triggering a page reload
		event.preventDefault();
		// see if we can find a chat object in the database
		// to which we'll add the message
		var chat = Chats.findOne({_id:Session.get("chatId")});
		if (chat){// ok - we have a chat to use
			var msgs = chat.messages; // pull the messages property
			if (!msgs){// no messages yet, create a new array
				msgs = [];
			}
			// is a good idea to insert data straight from the form
			// (i.e. the user) into the database?? certainly not. 
			// push adds the message to the end of the array
			var userId = Meteor.userId();
			var message = event.target.chat.value;
			msgs.push({
				userId: userId,
				text: message
			});
			// reset the form
			event.target.chat.value = "";
			// put the messages array onto the chat object
			chat.messages = msgs;
			console.log(userId);
			console.log(message)
			Meteor.call("updateChat", chat);
		}
	}
})

///
// other functions
///
function getUserName(userId) {
	user = Meteor.users.findOne({_id:userId});
	return user.profile.username;
}

function getUserAvatar(userId) {
	user = Meteor.users.findOne({_id:userId});
	return user.profile.avatar;
}

function isMyUser(userId) {
	if (userId == Meteor.userId()){
		return true;
	}
	else {
		return false;
	}
}
