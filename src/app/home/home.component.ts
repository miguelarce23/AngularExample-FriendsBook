import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Post } from '../_models/post';

import { User } from '../_models/user'
import { AlertService } from '../_services/alert.service';
import { AuthenticationService } from '../_services/authentication.service';
import { CommonService } from '../_services/common.service';
import { FileUploadService } from '../_services/fileUpload.service';
import { FriendsService } from '../_services/friends.service';
import { PostService } from '../_services/post.service';
import { UserService } from '../_services/user.service';
//import {UserService} from '../_services/user.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
 
  currentUser: User;
  viewingUser: User
  users = [];
  unauthorized: boolean = false;
  public postText: string = "This is my post text.";
  public friendsCount : number = 0;
  public postsCount : number = 0;
  public postsList: Post[] = [];
  public userPhoto: any;
  public viewUserId: string = "";
  public uploadingPostPicture = false;
  public postPicture: File;

  constructor( 
    private route : ActivatedRoute,
    private authenticationService: AuthenticationService,
    private friendsService: FriendsService,
    private postService: PostService,
    private alertService : AlertService,
    private fileUploadService : FileUploadService,
    private sanitizer : DomSanitizer,
    private userService : UserService
    ) { 
      this.currentUser = this.authenticationService.currentUserValue;
    }

  ngOnInit() {
    this.unauthorized = false;

    this.route.queryParams.subscribe(params =>{
      this.viewUserId = "";
      if(params['id'] != null && params['id'] != ""){
        this.viewUserId = params['id'];

        this.userService.getUserDetail(this.viewUserId).pipe().subscribe(data => {
          if(data != null){
            this.viewingUser = data;    
            this.loadProfileData();        
          }
        });

      }
      else{
        this.viewingUser = this.currentUser;
        
        this.loadProfileData();
      }
      
    });

    
    //alert('SUCCESS!! \n\n' + JSON.stringify(this.currentUser, null, 4));
    // this.loadAllUsers();
  }

  loadProfileData(){
    this.getAllPosts();
    this.setNumberOfFriends();
    this.setNumberOfPosts();
    this.userPhoto = this.getUserPhotoUrl(this.viewingUser.photoId);
  }

  uploadPostPicture(){
    

  }
  submitPost(){
    var post = new Post;
    post.post = this.postText;
    post.userId = this.currentUser._id;
    post.userPhotoId = this.currentUser.photoId;
    post.userName = this.currentUser.firstName + " " + this.currentUser.lastName;
    post.isActive = true;
    post.isAdmin = this.currentUser.isAdmin;
    post.profession = "user";

    this.sendPost(post);     
  }
  

  postAd(){
    var post = new Post;
    //add the "ad" tag to label as ad
    post.post = "<ad>" + this.postText;
    post.userId = this.currentUser._id;
    post.userPhotoId = this.currentUser.photoId;
    post.userName = this.currentUser.firstName + " " + this.currentUser.lastName;
    post.isActive = true;
    post.isAdmin = this.currentUser.isAdmin;
    post.profession = "user";
    
    this.sendPost(post);
  }

  sendPost(post: Post){

    if(this.postPicture){
      const formData = new FormData();
      formData.append("picture", this.postPicture);
      this.fileUploadService.uploadPhoto(formData).pipe().subscribe( data => {
        if(data){
          post.postImageId = data["uploadId"];
          this.postService.createPost(post)
          .pipe()
          .subscribe(
              data => {
                if(data != null){
                  this.alertService.success(data["message"]);
      
                  this.postText = "";
                  this.postPicture = null;
                  this.uploadingPostPicture = false;
      
                  this.refreshPage();
                }
                 
      
              },
              error => {
                  this.alertService.error(error);
              });

        }
      },
      error => {        
        this.alertService.error(error);
      });
  }

    

  }
  getAllPosts(){
    this.postService.getPostsByUserId(this.viewingUser._id)
    .pipe()
    .subscribe(
        postsList => {
          if(postsList != null){

            this.postService.getAllPosts().pipe().subscribe(allPosts => {
              var allAdminAds = allPosts.filter(x => x.post.startsWith("<ad>"));

              
              
              allAdminAds.forEach(ad => {

                ad.post = ad.post.substring(4);
                postsList.forEach( (post, index)=>{  
                  if(post.id == ad.id){
                    postsList.splice(index, 1);
                  }
                });
                postsList.push(ad);
              });
              

              var sortedData = postsList.sort((n1, n2) => {
                if(n1.createdDate > n2.createdDate){
                  return -1;
                }
                if(n1.createdDate < n2.createdDate){
                  return 1;
                }
                return 0;
              });
              this.postsList = sortedData;
              this.getPostPhotos();
            });




          }
           
        },
        error => {
            this.alertService.error(error);
        });
  }
  refreshPage(){
    this.loadProfileData();
  }

  setNumberOfFriends(){

    this.friendsService.getAllFriendRequests()
        .pipe()
        .subscribe(
            data => {
              if(data != null && data.length > 0){
                var friendCount = data.filter(x => (x.userId == this.viewingUser._id || x.friendId == this.viewingUser._id ) && x.status == "You are friend").length;
                this.friendsCount = friendCount;
              }
               

            },
            error => {
                
            });
  }

  setNumberOfPosts(){
    this.postService.getPostsByUserId(this.viewingUser._id)
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

  

  getPostPhotos(){
    this.postsList.forEach(post =>{
      if(post.userPhotoId != null){
        this.fileUploadService.getPhotoBlobById(post.userPhotoId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              post.userPhotoUrl = imageUrl;
            },
            error => {
                
            }); 
      }
      if(post.postImageId != null && post.postImageId != ""){
        this.fileUploadService.getPhotoBlobById(post.postImageId)
        .pipe()
        .subscribe(
            data => {
              var unsafeImageUrl = URL.createObjectURL(data);
              var imageUrl = this.sanitizer.bypassSecurityTrustUrl(unsafeImageUrl);
              post.postImageUrl = imageUrl;
            },
            error => {
                
            }); 
      }
    });
   
    
    
  }

  hideUnhidePost(post: Post){
    if(post.isActive){     
      this.postService.hideUnhidePost(post.id, false).pipe().subscribe(data => {
        post.isActive = false;
        this.alertService.success("Post has been hidden");
      });
    }
    else{
      this.postService.hideUnhidePost(post.id, true).pipe().subscribe(data => {
        post.isActive = true;
        this.alertService.success("Post is now visible");
      });
    }
    
  }
  uploadProfilePicture(e){

    const file:File = e.target.files[0];

    if(file){
      var fileName = file.name;
      const formData = new FormData();
      formData.append("picture", file);

      this.fileUploadService.uploadPhoto(formData).pipe().subscribe( data => {
        if(data){
          this.currentUser.photoId = data["uploadId"];
          this.userService.updateUserPhotoId(this.currentUser._id, this.currentUser.photoId).pipe().subscribe(data2 =>{
            this.postService.updateManyPosts(this.currentUser._id, this.currentUser.photoId).pipe().subscribe(data3 =>{
              localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
              this.refreshPage();
            },
            error => {
                this.alertService.error(error);
            });
          },
          error => {
              this.alertService.error(error);
          });
          
        }
      },
            error => {
                this.alertService.error(error);
            });

    }
  }
  postPictureChanged(e){
    this.postPicture = e.target.files[0];
    
  }
  selectPostPicture(){
    this.uploadingPostPicture = true;
  }


//   deleteUser(id: number) {
//     this.userService.delete(id)
//         .pipe(first())
//         .subscribe(() => this.loadAllUsers());
//     }

// private loadAllUsers() {
//     this.userService.getAll()
//         .pipe(first())
//         .subscribe(result => 
//           {
//             if(result == "unauthorized"){
//               this.users = [];
//               this.unauthorized = true;
//             }
//             else{
//               this.users = result;
//             }
//           });
// }

}
