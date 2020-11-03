const User = require('../models/user'); 
const Friends = require('../models/friends'); 

class AuthService {

    // check if user exists with given email
    userWithEmail = async (email) => {
        console.log(email)
        try {
            // check that email is not already used 
            const userExists = await User.findOne({email: email}); 
            if (userExists) {
                return true; 
            }
            else {
                return false;
            }
        }
        catch(err) {
            return false;
        }
    }
    // check if user already exists with given username
    userWithUsername = async (username) => {
        try {
            const user = await User.findOne({username: username}); 
            if (user) {
                return true; 
            }
            else {
                return false;
            }
        }
        catch(err) {
            return false; 
        }
    }

    // function will take in the sender and recipID and then return the status of their friendship: 
    // 0 --> not friends 
    // 1 ---> user has requested 
    // 2 ---> pending friend request from recipient
    // 3 -> friends already 
    friendStatus = async (senderId, recipientId) => {
        // check the friends array to see if the sender is already friends with 
        try {
            const sender = await User.findById(senderId); 
            const recipient = await User.findById(recipientId); 

            if (sender && recipient) {
                // now check the status of their friendship in the friends collection
                const senderFriend = await Friends.findOne({requester: sender._id, recipient: recipient._id}); 
                if (senderFriend) {
                    // then return the status of the sender's friendship with the recipient 
                    // will be either 1, 2, or 3
                    return senderFriend.status; 
                }
                return 0; 
    
            }
            else {
                return 0; 
            }   
        }
        catch(err) {
            return 0; 
        }
    }

    // function takes the user ID and returns all of the user's friends, in an array of objects 
    allFriends = async (id) => {
        const user = await User.findById(id); 
        if (user) {
            // create a mongo aggregation: NEED TO IMPROVE: TOO MANY QUERIES 
            const friends = user.friends
            if (friends.length > 0) {
                let ret = []
                // iterate through the friends of the user  
                await Promise.all(friends.map(async (friend) => {
                    // for each friend id, query for that document and the user will be the requestor so we want to map the recipient and return them
                    let friendDoc = await Friends.findById(friend); 
                    if (friendDoc.status == 3) {
                        // using the id of the recipient, we will find the 
                        let recipient = await User.findById(friendDoc.recipient);
                        ret.push({id: recipient._id, friends: recipient.friends, name: recipient.name, username: recipient.username, email: recipient.email})
                    }
                }))
                return ret; 
            }
            else {
                return []
            }

        }   
        return []; 

    }

}


module.exports = AuthService; 