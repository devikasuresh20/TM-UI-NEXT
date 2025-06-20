/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import {
  AuthService,
  ConfirmationService,
} from 'src/app/app-modules/core/services';
import { FormBuilder, Validators } from '@angular/forms';
import { MasterDownloadComponent } from '../data-sync/master-download/master-download.component';
import { DataSyncLoginComponent } from '../data-sync/data-sync-login/data-sync-login.component';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { environment } from 'src/environments/environment';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-login-cmp',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @ViewChild('captchaCmp') captchaCmp: CaptchaComponent | undefined;
  dynamictype = 'password';
  encryptedVar: any;
  key: any;
  iv: any;
  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword: any;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;

  @ViewChild('focus') private elementRef!: ElementRef;
  captchaToken!: string;
  enableCaptcha = environment.enableCaptcha;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
    private fb: FormBuilder,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  loginForm = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit() {
    if (sessionStorage.getItem('isAuthenticated')) {
      this.authService.validateSessionKey().subscribe((res: any) => {
        if (res && res.statusCode === 200 && res.data)
          this.router.navigate(['/service']);
      });
    } else {
      sessionStorage.clear();
    }
  }
  public AfterViewInit(): void {
    this.elementRef.nativeElement.focus();
  }

  login() {
    const encryptPassword = this.encrypt(
      this.Key_IV,
      this.loginForm.controls.password.value,
    );

    if (
      this.loginForm.controls.userName.value &&
      this.loginForm.controls.password.value
    ) {
      this.authService
        .login(
          this.loginForm.controls.userName.value.trim(),
          encryptPassword,
          false,
          this.enableCaptcha ? this.captchaToken : undefined,
        )
        .subscribe(
          (res: any) => {
            if (res.statusCode === 200) {
              if (res?.data?.previlegeObj[0]) {
                this.sessionstorage.setItem(
                  'loginDataResponse',
                  JSON.stringify(res.data),
                );
                this.getServicesAuthdetails(res.data);
              } else {
                this.confirmationService.alert(
                  'Seems you are logged in from somewhere else, Logout from there & try back in.',
                  'error',
                );
              }
            } else if (res.statusCode === 5002) {
              if (
                res.errorMessage ===
                'You are already logged in,please confirm to logout from other device and login again'
              ) {
                this.confirmationService
                  .confirm('info', res.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.authService
                        .userlogoutPreviousSession(
                          this.loginForm.controls.userName.value,
                        )
                        .subscribe((userlogoutPreviousSession: any) => {
                          if (userlogoutPreviousSession.statusCode === 200) {
                            this.authService
                              .login(
                                this.loginForm.controls.userName.value,
                                encryptPassword,
                                true,
                                this.enableCaptcha
                                  ? this.captchaToken
                                  : undefined,
                              )
                              .subscribe((userLoggedIn: any) => {
                                if (userLoggedIn.statusCode === 200) {
                                  if (userLoggedIn?.data?.previlegeObj[0]) {
                                    this.sessionstorage.setItem(
                                      'loginDataResponse',
                                      JSON.stringify(userLoggedIn.data),
                                    );
                                    this.getServicesAuthdetails(
                                      userLoggedIn.data,
                                    );
                                  } else {
                                    this.resetCaptcha();
                                    this.confirmationService.alert(
                                      'Seems you are logged in from somewhere else, Logout from there & try back in.',
                                      'error',
                                    );
                                  }
                                } else {
                                  this.resetCaptcha();
                                  this.confirmationService.alert(
                                    userLoggedIn.errorMessage,
                                    'error',
                                  );
                                }
                              });
                          } else {
                            this.resetCaptcha();
                            this.confirmationService.alert(
                              userlogoutPreviousSession.errorMessage,
                              'error',
                            );
                          }
                        });
                    } else {
                      this.resetCaptcha();
                      sessionStorage.clear();
                      this.router.navigate(['/login']);
                    }
                  });
              } else {
                this.resetCaptcha();
                this.confirmationService.alert(res.errorMessage, 'error');
              }
            }
          },
          (err) => {
            this.resetCaptcha();
            this.confirmationService.alert(err, 'error');
          },
        );
    }
  }

  get keySize() {
    return this._keySize;
  }

  set keySize(value) {
    this._keySize = value;
  }

  get iterationCount() {
    return this._iterationCount;
  }

  set iterationCount(value) {
    this._iterationCount = value;
  }

  generateKey(salt: any, passPhrase: any) {
    return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      hasher: CryptoJS.algo.SHA512,
      keySize: this.keySize / 32,
      iterations: this._iterationCount,
    });
  }

  encryptWithIvSalt(salt: any, iv: any, passPhrase: any, plainText: any) {
    const key = this.generateKey(salt, passPhrase);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  encrypt(passPhrase: any, plainText: any) {
    const iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
    return salt + iv + ciphertext;
  }

  getServicesAuthdetails(loginDataResponse: any) {
    const userName: any = this.loginForm.controls.userName.value;
    sessionStorage.setItem('key', loginDataResponse.key);
    sessionStorage.setItem(
      'isAuthenticated',
      loginDataResponse.isAuthenticated,
    );
    this.sessionstorage.setItem('userID', loginDataResponse.userID);
    this.sessionstorage.setItem('userName', loginDataResponse.userName);
    this.sessionstorage.setItem('username', userName);
    this.sessionstorage.setItem('fullName', loginDataResponse.fullName);
    const services: any = [];
    loginDataResponse.previlegeObj.map((item: any) => {
      if (
        item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
          .serviceID === 4
      ) {
        const service = {
          providerServiceID: item.serviceID,
          serviceName: item.serviceName,
          apimanClientKey: item.apimanClientKey,
          serviceID:
            item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
              .serviceID,
          serviceProviderID:
            item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
              .serviceProviderID,
        };
        services.push(service);
      }
    });
    if (services.length > 0) {
      this.sessionstorage.setItem('services', JSON.stringify(services));
      if (loginDataResponse.Status.toLowerCase() === 'new') {
        this.router.navigate(['/set-security-questions']);
      } else {
        this.router.navigate(['/service']);
      }
    } else {
      this.confirmationService.alert(
        "User doesn't have previlege to access the application",
      );
    }
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  loginDialogRef!: MatDialogRef<DataSyncLoginComponent>;
  openDialog() {
    this.loginDialogRef = this.dialog.open(DataSyncLoginComponent, {
      hasBackdrop: true,
      disableClose: true,
      panelClass: 'fit-screen',
      backdropClass: 'backdrop',
      position: { top: '20px' },
      data: {
        masterDowloadFirstTime: true,
      },
    });
    this.loginDialogRef.afterClosed().subscribe((flag) => {
      if (flag) {
        this.dialog
          .open(MasterDownloadComponent, {
            hasBackdrop: true,
            disableClose: true,
            panelClass: 'fit-screen',
            backdropClass: 'backdrop',
            position: { top: '20px' },
          })
          .afterClosed()
          .subscribe(() => {
            sessionStorage.clear();
            this.sessionstorage.clear();
          });
      }
    });
  }

  onCaptchaResolved(token: any) {
    this.captchaToken = token;
  }

  resetCaptcha() {
    if (
      this.enableCaptcha &&
      this.captchaCmp &&
      typeof this.captchaCmp.reset === 'function'
    ) {
      this.captchaCmp.reset();
      this.captchaToken = '';
    }
  }
}
