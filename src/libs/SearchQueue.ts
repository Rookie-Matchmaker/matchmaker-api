import Ticket from './Ticket';
import PlayerToTicketBiMap from './PlayerToTicketBiMap';
import Lobby from './Lobby';

export default class SearchQueue {
  private ticketMap: Map<string, Ticket> = new Map();

  private playerToTicketIDs = new PlayerToTicketBiMap();

  private queue: Array<string> = [];

  public enqueue(playerID: string): string {
    if (!this.playerToTicketIDs.hasPlayerID(playerID)) {
      const newTicket = new Ticket(playerID);
      this.queue = [...this.queue, newTicket.ticketID];
      this.playerToTicketIDs.set(playerID, newTicket.ticketID);
      this.ticketMap.set(newTicket.ticketID, newTicket);
      console.log(this.playerToTicketIDs);
      return newTicket.ticketID;
    }
    throw new Error(`Player ${playerID} is already in the queue`);
  }

  public dequeue(count = 10): Ticket[] {
    const dequeuedTicketsIDs = this.queue.splice(0, count);
    dequeuedTicketsIDs.forEach((ticketID) =>
      this.playerToTicketIDs.deleteByTicket(ticketID)
    );
    return dequeuedTicketsIDs.map((ticketID) => this.ticketMap.get(ticketID));
  }

  public createLobby(): [Lobby, Ticket[]] | [false] {
    // Meet conditions
    if (this.queue.length >= 10) {
      const lobbyTickets = this.dequeue();
      const newLobby = new Lobby(lobbyTickets);
      return [newLobby, lobbyTickets];
    }
    return [false];
  }

  public peek(): Ticket {
    console.log(this.ticketMap);
    return this.ticketMap.get(this.queue[0]);
  }

  public size(): number {
    return this.queue.length;
  }
}
