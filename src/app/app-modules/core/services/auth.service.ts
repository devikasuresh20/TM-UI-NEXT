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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {
  transactionId: any;
  constructor(private http: HttpClient) {}

  login(userName: any, password: string, doLogout: any, captchaToken?: string) {
    const requestBody: any = {
      userName: userName,
      password: password,
      doLogout: doLogout,
      withCredentials: true,
    };

    if (captchaToken) {
      requestBody.captchaToken = captchaToken;
    }
    return this.http.post(environment.loginUrl, requestBody);
  }
  userlogoutPreviousSession(userName: any) {
    console.log(
      'environment.userlogoutPreviousSessionUrl',
      environment.userLogoutPreviousSessionUrl,
    );
    return this.http.post(environment.userLogoutPreviousSessionUrl, {
      userName: userName,
    });
  }

  getUserSecurityQuestionsAnswer(uname: any): Observable<any> {
    return this.http.post(environment.getUserSecurityQuestionsAnswerUrl, {
      userName: uname.toLowerCase(),
    });
  }

  validateSecurityQuestionAndAnswer(ans: any, uname: any): Observable<any> {
    return this.http.post(environment.validateSecurityQuestions, {
      SecurityQuesAns: ans,
      userName: uname.toLowerCase(),
    });
  }

  getTransactionIdForChangePassword(uname: any): Observable<any> {
    return this.http.post(environment.getTransacIDForPasswordChange, {
      userName: uname.toLowerCase(),
    });
  }

  getSecurityQuestions() {
    return this.http.get(environment.getSecurityQuestionUrl);
  }

  saveUserSecurityQuestionsAnswer(userQuestionAnswer: any) {
    return this.http.post(
      environment.saveUserSecurityQuestionsAnswerUrl,
      userQuestionAnswer,
    );
  }

  setNewPassword(userName: string, password: string, transactionId: string) {
    return this.http.post(environment.setNewPasswordUrl, {
      userName: userName,
      password: password,
      transactionId: this.transactionId,
    });
  }

  validateSessionKey() {
    return this.http.post(environment.getSessionExistsURL, {});
  }

  logout() {
    return this.http.post(environment.logoutUrl, '');
  }

  getSwymedLogout() {
    return this.http.get(environment.getSwymedLogoutUrl);
  }

  getUIVersionAndCommitDetails(url: any) {
    return this.http.get(url);
  }
  getAPIVersionAndCommitDetails() {
    return this.http.get(environment.apiVersionUrl);
  }
}
