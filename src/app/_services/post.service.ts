import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Post } from '../_models/post'

@Injectable({ providedIn: 'root' })
export class PostService {
    apiUrl : string = 'https://nodejs-fb-app.herokuapp.com';

    constructor(private http: HttpClient) { }

    createPost(post: Post) {
        return this.http.post<Post>(`${this.apiUrl}/posts/createpost`, post);
    }

    getPostByPostId(postId: string) : any{
        return this.http.get<any>(`${this.apiUrl}/posts/${postId}`);
    }

    getPostsByUserId(userId: string) {
        return this.http.post<any[]>(`${this.apiUrl}/posts/findpostbyuserid`, { id: userId });
    }

    getAllPosts() {
        return this.http.get<Post[]>(`${this.apiUrl}/posts/`);
    }

    updatePost(post: Post){
        return this.http.put(`${this.apiUrl}/posts/${post.id}`, post);
    }
    hideUnhidePost(postId: string, isActive: boolean){
        return this.http.put(`${this.apiUrl}/posts/${postId}`, { isActive: isActive });
    }

    updateManyPosts(userId: string, photoId: string){
        return this.http.post<Post>(`${this.apiUrl}/posts/updatemanyposts`, {userId : userId, photoId : photoId});
    }
 
}