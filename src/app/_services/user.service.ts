import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user'
//import {environment} from '../environments/environment'

@Injectable({ providedIn: 'root' })
export class UserService {
    apiUrl : string = 'https://nodejs-fb-app.herokuapp.com';
    constructor(private http: HttpClient) { }

    register(user: User) {
        return this.http.post<User>(`${this.apiUrl}/users/register`, user);
    }

    getAll() : any{
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    delete(id: string) {
        return this.http.delete(`${this.apiUrl}/users/${id}`);
    }

    getUserDetail(id: string){
        return this.http.get<User>(`${this.apiUrl}/users/${id}`);
    }
 
    findUserByEmail(email: string){
        return this.http.post<User>(`${this.apiUrl}/users/finduserbyemail`, { email: email });
    }

    updateUser(updatedUser: User){
        return this.http.put(`${this.apiUrl}/users/${updatedUser._id}`, updatedUser);
    }

    blockUnblockUser(userId: string, active: boolean){
        return this.http.put(`${this.apiUrl}/users/${userId}`, { isActive: active });
    }
    updateUserPhotoId(userId: string, photoId: string){
        return this.http.post(`${this.apiUrl}/users/updateuserphotoId`, { id : userId, photoId : photoId});
    }
}