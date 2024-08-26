import Bool "mo:base/Bool";

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

actor {
  // Types
  type UserId = Principal;
  type Status = {
    id: Nat;
    text: Text;
    timestamp: Time.Time;
    author: UserId;
  };
  type User = {
    id: UserId;
    name: Text;
    bio: ?Text;
    connections: [UserId];
  };

  // Stable variables
  private stable var nextStatusId: Nat = 0;
  private stable var usersEntries : [(UserId, User)] = [];
  private stable var statusesEntries : [(Nat, Status)] = [];

  // In-memory storage
  private var users = HashMap.HashMap<UserId, User>(0, Principal.equal, Principal.hash);
  private var statuses = HashMap.HashMap<Nat, Status>(0, Nat.equal, Hash.hash);

  // System functions
  system func preupgrade() {
    usersEntries := Iter.toArray(users.entries());
    statusesEntries := Iter.toArray(statuses.entries());
  };

  system func postupgrade() {
    users := HashMap.fromIter<UserId, User>(usersEntries.vals(), 0, Principal.equal, Principal.hash);
    statuses := HashMap.fromIter<Nat, Status>(statusesEntries.vals(), 0, Nat.equal, Hash.hash);
  };

  // User management
  public shared(msg) func createUser(name : Text) : async Result.Result<(), Text> {
    let userId = msg.caller;
    switch (users.get(userId)) {
      case (?_) { #err("User already exists") };
      case null {
        let newUser : User = {
          id = userId;
          name = name;
          bio = null;
          connections = [];
        };
        users.put(userId, newUser);
        #ok(())
      };
    }
  };

  public query func getUser(userId : UserId) : async ?User {
    users.get(userId)
  };

  public shared(msg) func updateUser(name : Text, bio : ?Text) : async Result.Result<(), Text> {
    let userId = msg.caller;
    switch (users.get(userId)) {
      case (?user) {
        let updatedUser : User = {
          id = userId;
          name = name;
          bio = bio;
          connections = user.connections;
        };
        users.put(userId, updatedUser);
        #ok(())
      };
      case null { #err("User not found") };
    }
  };

  // Status management
  public shared(msg) func postStatus(text : Text) : async Result.Result<(), Text> {
    let userId = msg.caller;
    switch (users.get(userId)) {
      case (?_) {
        let newStatus : Status = {
          id = nextStatusId;
          text = text;
          timestamp = Time.now();
          author = userId;
        };
        statuses.put(nextStatusId, newStatus);
        nextStatusId += 1;
        #ok(())
      };
      case null { #err("User not found") };
    }
  };

  public query func getStatusFeed(userId : UserId) : async [Status] {
    switch (users.get(userId)) {
      case (?user) {
        let userAndConnections = Array.append([userId], user.connections);
        let allStatuses = Iter.toArray(statuses.vals());
        Array.filter(allStatuses, func (status : Status) : Bool {
          Array.find(userAndConnections, func (id : UserId) : Bool { id == status.author }) != null
        })
      };
      case null { [] };
    }
  };

  // Connection management
  public shared(msg) func addConnection(connectionId : UserId) : async Result.Result<(), Text> {
    let userId = msg.caller;
    switch (users.get(userId)) {
      case (?user) {
        if (Array.find(user.connections, func (id : UserId) : Bool { id == connectionId }) != null) {
          #err("Connection already exists")
        } else {
          let updatedUser : User = {
            id = userId;
            name = user.name;
            bio = user.bio;
            connections = Array.append(user.connections, [connectionId]);
          };
          users.put(userId, updatedUser);
          #ok(())
        }
      };
      case null { #err("User not found") };
    }
  };

  public query func getConnections(userId : UserId) : async [UserId] {
    switch (users.get(userId)) {
      case (?user) { user.connections };
      case null { [] };
    }
  };
}
