import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

import {UserService} from '../_services/user.service'
import {  AuthenticationService } from '../_services/authentication.service';
import {AlertService} from '../_services/alert.service'
import { User } from '../_models/user';
import { ConfirmPasswordValidator } from '../_helpers/mismatch.validator';
//import { Role } from '../_models/role';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  constructor( private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService) {
      if (this.authenticationService.currentUserValue) {
        this.router.navigate(['/']);
    }
     }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      dob: ['', [Validators.required, Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]],
      gender: ['', Validators.required]
      }
      , {
        validator: ConfirmPasswordValidator.MatchPassword
      }
      );
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    this.alertService.clear();

    if (this.registerForm.invalid) {
      return;
    }

    let user = new User;
    
    user.firstName = this.registerForm.value["firstName"];
    user.lastName = this.registerForm.value["lastName"];
    user.email = this.registerForm.value["email"];
    user.password = this.registerForm.value["password"];
    user.dob = this.registerForm.value["dob"];
    user.gender = this.registerForm.value["gender"];
    //user.role = new Role;
    
    //user.role.type = this.registerForm.value["role"] === true ? "Admin" : "User";


    this.loading = true;
    this.userService.register(user)
        .pipe(first())
        .subscribe(
            data => {
                this.alertService.success('Registration successful', true);
                this.router.navigate(['/login']);
            },
            error => {
              this.alertService.error(error);
                this.loading = false;
            });
  } 

  


}
