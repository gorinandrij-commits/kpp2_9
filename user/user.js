async function inviteUserToRoom() {
  if (!this.inviteUser?.trim() || !this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${this.roomId}/invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: this.inviteUser.trim() })
      }
    );

    const data = await res.json();
    this.inviteUser = '';
    await this.fetchRoomsWithNames();

  } catch (e) {
    console.error('Invite error:', e);
  }
}


async function joinRoom() {
  if (!this.joinRoomId?.trim()) return;

  try {
    const roomId = this.joinRoomId.trim();

    await fetch(
      `https://matrix.org/_matrix/client/r0/join/${encodeURIComponent(roomId)}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      }
    );

    this.roomId = roomId;
    this.joinRoomId = '';
    this.messages = [];
    this.lastSyncToken = '';

    await this.fetchRoomsWithNames();
    this.fetchMessages();
    this.fetchRoomMembers();

  } catch (e) {
    console.error('Join room error:', e);
  }
}


async function fetchRoomMembers() {
  if (!this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/joined_members`,
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );

    const data = await res.json();

    this.roomMembers = Object.entries(data.joined || {}).map(
      ([userId, info]) => ({
        userId,
        displayName: info.display_name || userId.split(':')[0].substring(1),
        avatarUrl: info.avatar_url
      })
    );

  } catch (e) {
    console.error('Fetch room members error:', e);
  }
}
