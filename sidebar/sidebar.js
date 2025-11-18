async function createRoom() {
  if (!this.newRoomName.trim()) return;

  try {
    const res = await fetch(
      'https://matrix.org/_matrix/client/r0/createRoom',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          preset: 'private_chat',
          name: this.newRoomName.trim(),
          invite: []
        })
      }
    );

    const data = await res.json();

    if (data.room_id) {
      this.newRoomId = data.room_id;
      this.roomId = data.room_id;
      this.messages = [];
      this.lastSyncToken = '';
      await this.fetchRoomsWithNames();
    }
  } catch (e) {
    console.error('Create room error:', e);
  }
}


async function fetchRoomsWithNames() {
  if (!this.accessToken) return;

  try {
    const res = await fetch(
      'https://matrix.org/_matrix/client/r0/joined_rooms',
      { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
    );

    const data = await res.json();

    if (data.joined_rooms) {
      const roomPromises = data.joined_rooms.map(async roomId => {
        const nameRes = await fetch(
          `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/state/m.room.name`,
          { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
        );

        const nameData = await nameRes.json();
        return {
          roomId,
          name: nameData.name || roomId
        };
      });

      this.rooms = await Promise.all(roomPromises);

      if (this.rooms.length > 0 && !this.roomId) {
        this.roomId = this.rooms[0].roomId;
      }
    }

  } catch (e) {
    console.error('Fetch rooms error:', e);
  }
}


function getRoomName(roomId) {
  return this.rooms.find(r => r.roomId === roomId)?.name || roomId;
}

async function leaveRoom(roomId) {
  if (!this.accessToken || !roomId) return;

  if (!confirm(`Ви впевнені, що хочете покинути (видалити) кімнату?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/leave`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const data = await res.json();

    if (res.ok) {
      // Видаляємо локально
      this.rooms = this.rooms.filter(r => r.roomId !== roomId);

      if (this.roomId === roomId) {
        this.roomId = '';
        this.messages = [];
        this.roomMembers = [];
      }

      alert('Кімнату покинуто.');
      await this.fetchRoomsWithNames();
    } else {
      alert('Не вдалося покинути кімнату: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
}

async function kickUser(userId) {
  if (!this.accessToken || !this.roomId || !userId) return;

  if (!confirm(`Викинути користувача ${userId} з кімнати?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/kick`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    );

    const data = await res.json();

    if (res.ok) {
      this.roomMembers = this.roomMembers.filter(m => m.userId !== userId);
      alert(`Користувач ${userId} викинутий з кімнати.`);
      this.fetchRoomMembers();
    } else {
      alert('Не вдалося викинути користувача: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
}



function switchRoom(roomId) {
  this.roomId = roomId;
  this.messages = [];
  this.lastSyncToken = '';
  this.fetchMessages();
  this.fetchRoomMembers();
}
async function fetchRoomMembers() {
  if (!this.accessToken || !this.roomId) return;

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/joined_members`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const data = await res.json();

    if (data.joined) {
      this.roomMembers = Object.keys(data.joined).map(userId => ({
        userId,
        displayName: data.joined[userId].display_name || userId
      }));
    }

  } catch (e) {
    console.error('Fetch members error:', e);
  }
}

async function leaveRoom(roomId) {
  if (!this.accessToken || !roomId) return;

  if (!confirm(`Ви впевнені, що хочете покинути (видалити) кімнату?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/leave`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    const data = await res.json();

    if (res.ok) {
      this.rooms = this.rooms.filter(r => r.roomId !== roomId);

      if (this.roomId === roomId) {
        this.roomId = '';
        this.messages = [];
        this.roomMembers = [];
      }

      alert('Кімнату покинуто.');
      await this.fetchRoomsWithNames();
    } else {
      alert('Не вдалося покинути кімнату: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
}

async function kickUser(userId) {
  if (!this.accessToken || !this.roomId || !userId) return;

  if (!confirm(`Викинути користувача ${userId} з кімнати?`)) {
    return;
  }

  try {
    const res = await fetch(
      `https://matrix.org/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/kick`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ user_id: userId })
      }
    );

    const data = await res.json();

    if (res.ok) {
      this.roomMembers = this.roomMembers.filter(m => m.userId !== userId);
      alert(`Користувач ${userId} викинутий з кімнати.`);
      this.fetchRoomMembers();
    } else {
      alert('Не вдалося викинути користувача: ' + (data.error || 'Невідома помилка'));
    }
  } catch (e) {
    alert('Помилка: ' + e.message);
  }
}

function sidebarApp() {
  return {
    accessToken: '',
    rooms: [],
    roomId: '',
    roomMembers: [],
    
    newRoomName: '',
    newRoomId: '',

    // Методи
    createRoom: createRoom,
    fetchRoomsWithNames: fetchRoomsWithNames,
    switchRoom: switchRoom,
    fetchRoomMembers: fetchRoomMembers,

    leaveRoom: leaveRoom,
    kickUser: kickUser,
  };
}