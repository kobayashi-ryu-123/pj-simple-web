import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LOGIN_CREDENTIAL } from '../../login-credentials';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  userId = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onLogin() {
    if (!this.userId || !this.password) {
      this.errorMessage = 'ユーザーIDとパスワードを入力してください。';
      return;
    }

    // 疑似ログイン判定
    if (
      this.userId === LOGIN_CREDENTIAL.userId
      && this.password === LOGIN_CREDENTIAL.password
    ) {
      // 成功
      this.errorMessage = '';
      this.router.navigate(['/dashboard'], { queryParams: { user: this.userId } });
    } else {
      // 失敗
      this.errorMessage = 'ユーザーIDまたはパスワードが間違っています。';
    }
  }
}
