import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      tenDangNhap: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      matKhau: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]],
      xacNhanMatKhau: ['', [Validators.required]],
      hoTen: ['', [Validators.required, Validators.maxLength(100)]],
      ngaySinh: [''],
      diaChi: ['', [Validators.maxLength(255)]],
      soDT: ['', [Validators.maxLength(20)]],
      agreeTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('matKhau');
    const confirmPassword = control.get('xacNhanMatKhau');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerData: RegisterRequest = {
        tenDangNhap: this.registerForm.value.tenDangNhap,
        email: this.registerForm.value.email,
        matKhau: this.registerForm.value.matKhau,
        xacNhanMatKhau: this.registerForm.value.xacNhanMatKhau,
        hoTen: this.registerForm.value.hoTen,
        ngaySinh: this.registerForm.value.ngaySinh ? new Date(this.registerForm.value.ngaySinh) : undefined,
        diaChi: this.registerForm.value.diaChi,
        soDT: this.registerForm.value.soDT
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} không được để trống`;
      }
      if (field.errors['email']) {
        return 'Email không hợp lệ';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} phải có ít nhất ${field.errors['minlength'].requiredLength} ký tự`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} không được quá ${field.errors['maxlength'].requiredLength} ký tự`;
      }
      if (field.errors['requiredTrue']) {
        return 'Bạn phải đồng ý với điều khoản sử dụng';
      }
    }
    
    // Check for form-level validation errors
    if (fieldName === 'xacNhanMatKhau' && this.registerForm.errors?.['passwordMismatch'] && field?.touched) {
      return 'Mật khẩu xác nhận không khớp';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tenDangNhap: 'Tên đăng nhập',
      email: 'Email',
      matKhau: 'Mật khẩu',
      xacNhanMatKhau: 'Xác nhận mật khẩu',
      hoTen: 'Họ tên',
      ngaySinh: 'Ngày sinh',
      diaChi: 'Địa chỉ',
      soDT: 'Số điện thoại'
    };
    return labels[fieldName] || fieldName;
  }
}
