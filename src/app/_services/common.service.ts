import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../_models/user'
import { FriendsService } from './friends.service';
import { PostService } from './post.service';
import { AlertService } from './alert.service';
import { FileUploadService } from './fileUpload.service';
import { DomSanitizer } from '@angular/platform-browser';
//import {environment} from '../environments/environment'

@Injectable({ providedIn: 'root' })
export class CommonService {
    
    constructor(
        private friendsService: FriendsService,
        private postService: PostService,
        private alertService : AlertService,
        private fileUploadService : FileUploadService,
        private sanitizer : DomSanitizer
    ) { }

    setNumberOfFriends(model : { friendsCount: number}, currentUserId : string){

        this.friendsService.getAllFriendRequests()
            .pipe()
            .subscribe(
                data => {
                  if(data != null && data.length > 0){
                    var friendCount = data.filter(x => x.userId == currentUserId && x.status == "You are friend").length;
                    model.friendsCount = friendCount;
                  }
                   
    
                },
                error => {
                    
                });
      }

      setNumberOfPosts(postsCount: number, currentUserId : string){
        this.postService.getPostsByUserId(currentUserId)
        .pipe()
        .subscribe(
            data => {
              if(data != null && data.length > 0){
                postsCount = data.length;
                
              }
               
    
            },
            error => {
                
            });
      }
      getUserPhotoUrl(id: string, userPhoto: any) {
        this.fileUploadService.getPhotoBlobById(id)
            .pipe()
            .subscribe(
                data => {
                  var unsafeImageUrl = URL.createObjectURL(data);
                  var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
                  userPhoto = imageUrl;
                },
                error => {
                    
                }); 
      }
 
}