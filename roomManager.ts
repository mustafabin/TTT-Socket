import { ServerWebSocket } from "bun"
import { HardRoom, NormalRoom } from "./gameRooms"
type roomTypes = "normal" | "hard"
export default class RoomManager {
  private rooms: Map<string, NormalRoom | HardRoom>
  private roomIDs: Set<string>
  constructor() {
    this.rooms = new Map()
    this.roomIDs = new Set()
  }
  // ? i really wanted a short code so it tries mulitple times to gen but with a set it wont nearly be as inefficent as a normal array
  private generateRoomId = (length = 4) => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let result = ""
    let attempts = 0

    do {
      result = ""
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      attempts++
    } while (this.roomIDs.has(result) && attempts < 10)

    return attempts < 10 ? result : null
  }
  allRooms = () => {
    return Array.from(this.roomIDs)
  }
  createNewRoom = (roomType: roomTypes) => {
    let generatedID = this.generateRoomId()
    if (!generatedID) return false
    // ? in the future if more i make more room types seperate the logic
    const room = roomType === "normal" ? new NormalRoom() : new HardRoom()
    this.roomIDs.add(generatedID)
    this.rooms.set(generatedID, room)
    return generatedID
  }
  getRoom = (roomID: string) => {
    return this.rooms.get(roomID)
  }
  removeRoom = (roomID: string) => {
    this.rooms.delete(roomID)
    this.roomIDs.delete(roomID)
  }
  assignPlayer = (ws:ServerWebSocket<any>, roomID:string)=>{
    let currentRoom = this.getRoom(roomID)
    if(!currentRoom) return false
    return currentRoom.assignPlayer(ws)
  }
  removePlayer = (ws:ServerWebSocket<any>, roomID:string)=>{
    let currentRoom = this.getRoom(roomID)
    if(!currentRoom) return false
    currentRoom.removePlayer(ws)
    // todo in the future if the room is empty remove it
  }
}
