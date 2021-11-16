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
  selector: 'app-userslist',
  templateUrl: './userslist.component.html',
  styleUrls: ['./userslist.component.css']
})
export class UserslistComponent implements OnInit {

  currentUser: User;
  public friendsCount : number = 0;
  public postsCount : number = 0;
  public usersList: User[] = [];
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
    this.getAllUsers();
    this.setNumberOfFriends();
    this.setNumberOfPosts();
    
  }


  refreshPage(){
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

  getAllUsersPhotos(){
    
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
           
            this.usersList = allUsers;     
            this.getAllUsersPhotos();        
          }

        },
        error => {
            
        });
    
  }
  onImageClick(user: User){
    this.router.navigate(['home'], {queryParams: {id: user._id} });
  }

  blockUnblockUser(user: User){
    if(user.isActive){
      //block
      this.userService.blockUnblockUser(user._id, false).pipe().subscribe(
        data => {
          user.isActive = false;
          this.alertService.success(user.firstName + " " + user.lastName + " has been blocked.");
        }
      );
    }
    else{
      //unblock
      this.userService.blockUnblockUser(user._id, true).pipe().subscribe(
        data => {
          user.isActive = true;
          this.alertService.success(user.firstName + " " + user.lastName + " has been unblocked.");
        }
      );
    }
  }

}
