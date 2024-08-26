export const idlFactory = ({ IDL }) => {
  const UserId = IDL.Principal;
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Time = IDL.Int;
  const Status = IDL.Record({
    'id' : IDL.Nat,
    'text' : IDL.Text,
    'author' : UserId,
    'timestamp' : Time,
  });
  const User = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'connections' : IDL.Vec(UserId),
  });
  return IDL.Service({
    'addConnection' : IDL.Func([UserId], [Result], []),
    'createUser' : IDL.Func([IDL.Text], [Result], []),
    'getConnections' : IDL.Func([UserId], [IDL.Vec(UserId)], ['query']),
    'getStatusFeed' : IDL.Func([UserId], [IDL.Vec(Status)], ['query']),
    'getUser' : IDL.Func([UserId], [IDL.Opt(User)], ['query']),
    'postStatus' : IDL.Func([IDL.Text], [Result], []),
    'updateUser' : IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
