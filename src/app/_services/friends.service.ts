import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Friend } from '../_models/friend'

@Injectable({ providedIn: 'root' })
export class FriendsService {
    apiUrl : string = 'https://nodejs-fb-app.herokuapp.com';

    constructor(private http: HttpClient) { }

    createRequest(friend: Friend) {
        return this.http.post(`${this.apiUrl}/friends/createrequest`, friend);
    }

    updateFriendRequestById(updatedRequest: Friend) : any{
        return this.http.put<any>(`${this.apiUrl}/friends/${updatedRequest.id}`, updatedRequest);
    }
    
    getAllFriendRequests() {
        return this.http.get<any[]>(`${this.apiUrl}/friends/`);
    }

    getFriendRequestById(id: string) : any{
        return this.http.get<Friend>(`${this.apiUrl}/friends/${id}`);
    }

 
}