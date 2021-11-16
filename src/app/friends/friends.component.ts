import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Friend, FriendDto } from '../_models/friend';


import { User } from '../_models/user'
import { AlertService } from '../_services/alert.service';
import {  AuthenticationService } from '../_services/authentication.service';
import { FileUploadService } from '../_services/fileUpload.service';
import { FriendsService } from '../_services/friends.service';
import { PostService } from '../_services/post.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  currentUser: User;
  public friendsCount : number = 0;
  public postsCount : number = 0;
  public friendsList: FriendDto[] = [];
  public userPhoto: any;

  constructor( 
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
    private postService: PostService,
    private alertService : AlertService,
    private fileUploadService : FileUploadService,
    private sanitizer : DomSanitizer,
    private userService : UserService,
    public router : Router
    ) { 
      this.currentUser = this.authenticationService.currentUserValue;
    }
  ngOnInit(): void {
    this.userPhoto = this.getUserPhotoUrl(this.currentUser.photoId);
    this.getAllFriends();
    this.setNumberOfFriends();
    this.setNumberOfPosts();
    
  }


  refreshPage(){
    this.setNumberOfFriends();
    this.setNumberOfPosts();   
    this.getAllFriends();
    
  }

  setNumberOfFriends(){

    this.friendsService.getAllFriendRequests()
        .pipe()
        .subscribe(
            data => {
              if(data != null && data.length > 0){
                var friendCount = data.filter(x => (x.userId == this.currentUser._id || x.friendId == this.currentUser._id) && x.status == "You are friend").length;
                this.friendsCount = friendCount;
              }
               

            },
            error => {
                
            });
  }

  setNumberOfPosts(){
    this.postService.getPostsByUserId(this.currentUser._id)
    .pipe()
    .subscribe(
        data => {
          if(data != null && data.length > 0){
            this.postsCount = data.length;
            
          }
           

        },
        error => {
            
        });
  }
  getUserPhotoUrl(id: string) {
    this.fileUploadService.getPhotoBlobById(id)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              this.userPhoto = imageUrl;
            },
            error => {
                
            }); 
  }
 
  getFriendPhoto(friend: FriendDto){
   
      if(friend.photoId != null){
        this.fileUploadService.getPhotoBlobById(friend.photoId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              friend.photoUrl = imageUrl;
            },
            error => {
                
            }); 
      }
  }

  getAllFriends(){

  // first we get all friends
    this.friendsService.getAllFriendRequests()
    .pipe()
    .subscribe( allFriends => {
      var myRequests = Array<any>();
      var requestsToMe = Array<any>();
      if(allFriends != null && allFriends.length > 0){
        // get only my friends
        myRequests = allFriends.filter(x => (x.userId == this.currentUser._id ) && x.status == "You are friend");
        
        myRequests.forEach( friend =>{

          this.userService.getUserDetail(friend.friendId)
          .pipe()
          .subscribe(
            user => {
              if(user != null){
                if(user._id != this.currentUser._id){
                  var friendDto = new FriendDto;
                  friendDto.id = friend.friendId;
                  friendDto.photoId = user.photoId;
                  friendDto.fullName = user.firstName + " " + user.lastName;
                  this.getFriendPhoto(friendDto);
                  this.friendsList.push(friendDto);
                }                      
              }
            }
          );

        });
        
        requestsToMe = allFriends.filter(x => (x.friendId == this.currentUser._id ) && x.status == "You are friend");
        
        requestsToMe.forEach( friend =>{

          this.userService.getUserDetail(friend.userId)
          .pipe()
          .subscribe(
            user => {
              if(user != null){
                if(user._id != this.currentUser._id){
                  var friendDto = new FriendDto;
                  friendDto.id = friend.userId;
                  friendDto.photoId = user.photoId;
                  friendDto.fullName = user.firstName + " " + user.lastName;
                  this.getFriendPhoto(friendDto);
                  this.friendsList.push(friendDto);
                }                      
              }
            }
          );

        });
        
      }
    }

    );
    
  }
  onImageClick(friend: FriendDto){
    this.router.navigate(['home'], {queryParams: {id: friend.id} });
  }

}
