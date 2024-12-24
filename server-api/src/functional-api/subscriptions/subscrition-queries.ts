export const subscriptionSubspaceCreated = `subscription SubspaceCreated($spaceID: UUID_NAMEID!) {  subspaceCreated(spaceID: $spaceID) {
		spaceID
    subspace{
      profile{
        displayName
      }
    }
  }
}`;

export const subscriptionOpportunityCreated = `subscription SubspaceCreated($subspaceID: UUID!) {\n  subspaceCreated(subspaceID: $subspaceID) {
  subspace{
    profile {
      displayName
    }
  }
}
}`;

export const subscriptionRooms = `subscription roomEvents($roomID: UUID!) {
  roomEvents(roomID: $roomID) {
    message {
      data {
        id
        message
        sender {
          id
        }
      }
    }
  }
}`;
