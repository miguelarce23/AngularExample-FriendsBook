import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Friend } from '../_models/friend';


import { User } from '../_models/user'
import { AlertService } from '../_services/alert.service';
import {  AuthenticationService } from '../_services/authentication.service';
import { FileUploadService } from '../_services/fileUpload.service';
import { FriendsService } from '../_services/friends.service';
import { PostService } from '../_services/post.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.css']
})
export class NetworkComponent implements OnInit {
  currentUser: User;
  public friendsCount : number = 0;
  public postsCount : number = 0;
  public usersList: User[] = [];
  public requestedToMeList: User [] = [];
  public requestedByMeList: User [] = [];
  public userPhoto: any;

  constructor( 
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
    private postService: PostService,
    private alertService : AlertService,
    private fileUploadService : FileUploadService,
    private sanitizer : DomSanitizer,
    private userService : UserService,
    public router: Router
    ) { 
      this.currentUser = this.authenticationService.currentUserValue;
    }
  ngOnInit(): void {
    this.userPhoto = this.getUserPhotoUrl(this.currentUser.photoId);
    this.getAllUsers();
    this.setNumberOfFriends();
    this.setNumberOfPosts();
   
  }


  refreshPage(){
    this.requestedByMeList = [];
    this.requestedToMeList = [];
    this.usersList = [];
    this.setNumberOfFriends();
    this.setNumberOfPosts();   
    this.getAllUsers();
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
  getAllUsersPhotos(){
    this.requestedByMeList.forEach(user =>{
      if(user.photoId != null){
        this.fileUploadService.getPhotoBlobById(user.photoId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              user.photoUrl = imageUrl;
            },
            error => {
                
            }); 
      }
    });

    this.requestedToMeList.forEach(user =>{
      if(user.photoId != null){
        this.fileUploadService.getPhotoBlobById(user.photoId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              user.photoUrl = imageUrl;
            },
            error => {
                
            }); 
      }
    });

    this.usersList.forEach(user =>{
      if(user.photoId != null){
        this.fileUploadService.getPhotoBlobById(user.photoId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              user.photoUrl = imageUrl;
            },
            error => {
                
            }); 
      }
    });
   
    
    
  }

  getAllUsers(){

  // first we get all friends
    this.friendsService.getAllFriendRequests()
    .pipe()
    .subscribe( allFriends => {
      var myFriendRequests = Array<any>();
      var friendRequestsToMe = Array<any>();

      if(allFriends != null && allFriends.length > 0){
        // get only my friends
        myFriendRequests = allFriends.filter(x => x.userId == this.currentUser._id);

        friendRequestsToMe = allFriends.filter(x => x.friendId == this.currentUser._id && x.status == "Request Pending");
         
        // now we get all users
        this.userService.getAll()
        .pipe()
        .subscribe(
            allUsers => {
              if(allUsers != null && allUsers.length > 0){
                //filter myself out
                allUsers.forEach( (user, index)=>{  
                  if(user._id == this.currentUser._id){
                    allUsers.splice(index, 1);
                  }
                });
               //filter out my friends               
                myFriendRequests.forEach( friendRequest => {     
                  allUsers.forEach( (user, index)=>{             

                    if(user._id == friendRequest.friendId){
                      
                      if(friendRequest.status == "You are friend"){
                        allUsers.splice(index, 1);
                      }
                      else{
                        user.friendStatus = friendRequest.status;
                        this.requestedByMeList.push(user);
                        allUsers.splice(index, 1);
                      }
                      
                    }
               
                  });
                });

                friendRequestsToMe.forEach( friendRequest => {     
                  allUsers.forEach( (user, index)=>{             

                    if(user._id == friendRequest.userId){
                     this.requestedToMeList.push(user); 
                     allUsers.splice(index, 1);                     
                    }
               
                  });
                 
                });

                this.usersList = allUsers;     
                this.getAllUsersPhotos();        
              }
    
            },
            error => {
                
            });
      }
    }

    );
    
  }
  sendRequest(user: User){
    var friend = new Friend;
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = "Request Pending";
    
    
    
    this.friendsService.createRequest(friend)
        .pipe()
        .subscribe(
            data => {
              if(data != null){
                this.alertService.success("Friend Request Sent");
                this.refreshPage();
              }         

            },
            error => {
                
            });
  }
  acceptRequest(user: User){
    var friend = new Friend;
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = "You are friend";

    this.updateRequest(friend, true);
  }
  rejectRequest(user: User){
    var friend = new Friend;
    friend.userId = this.currentUser._id;
    friend.friendId = user._id;
    friend.status = "Request Rejected";

    this.updateRequest(friend, false);
  }
  updateRequest(friend: Friend, accepted: boolean){
    this.friendsService.getAllFriendRequests()
    .pipe()
    .subscribe(
        data => {
          if(data != null && data.length > 0){
            //get existing request
            var friendRequest = data.filter(x => x.userId == friend.friendId && x.friendId == this.currentUser._id);
            friend.id = friendRequest[0].id;

            this.friendsService.updateFriendRequestById(friend)
            .pipe()
            .subscribe(
                data => {
                  if(data != null){
                    if(accepted){
                      this.alertService.success("Friend Request Accepted");
                    }
                    else{
                      this.alertService.success("Friend Request Rejected");
                    }
                    
                    this.refreshPage();
                  }         
        
                },
                error => {
                    
                });
          }
           

        },
        error => {
            
        });    
  }
  onImageClick(user: User){
    this.router.navigate(['home'], {queryParams: {id: user._id} });
  }
}
