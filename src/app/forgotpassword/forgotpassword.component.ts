import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmPasswordValidator } from '../_helpers/mismatch.validator';
import { User } from '../_models/user';
import { AlertService } from '../_services/alert.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  public forgotPasswordForm: FormGroup;
  public resetPasswordForm: FormGroup;
  public loading = false;
  public submitted = false;
  public foundEmail = false;
  user : User;

  constructor(private userService: UserService,
    private router: Router,
    private alertService: AlertService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', Validators.required],
      dob: ['', [Validators.required, Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]]
    });

    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      }
      , {
        validator: ConfirmPasswordValidator.MatchPassword
      });
  }

  get getFPForm() { return this.forgotPasswordForm.controls; }
  get getRPForm() { return this.resetPasswordForm.controls; }

  checkEmailAndDOB(){
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
  }

    this.loading = true;
    
    var email = this.forgotPasswordForm["email"];

    this.userService.findUserByEmail(email).pipe().subscribe(data =>{
      if(data != null){
        if(data._id != undefined && data._id != null || data._id != "")//valid user
        {
          this.user = data;
          this.foundEmail = true;
          this.loading = false;
          this.submitted = false;
        } 
        else{
          this.alertService.error("Email not found");
        }
      }
    })

  }
  resetPassword(){
    if(this.user != null){
      this.loading = true;
      this.submitted = true;
  
      this.user.password = this.resetPasswordForm["password"];

      // WARNING
      // missing service to update user password only (this call does not work because it requires authentication token)
      this.userService.updateUser(this.user).pipe().subscribe( data => {
        if(data != null){
          this.user = null;
          this.loading = false;
          this.submitted = false;      
          this.alertService.success("Password Successfully Updated")
          this.router.navigate(['/login']);
          this.foundEmail = false;
        }
      })

    }  
    else{
      this.foundEmail = false;
    }
    
  }
}
