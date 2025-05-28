from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import CustomUser, Post
import re


class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(
        label="Имя",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'Введите ваше имя',
            'class': 'form-control',
            'data-pattern': '^[А-ЯЁ][а-яё]{1,30}$',
            'data-pattern-error': 'Только буквы, первая заглавная',
            'data-required-error': 'Поле обязательно для заполнения',
            'autofocus': True,
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
        }
    )

    last_name = forms.CharField(
        label="Фамилия",
        max_length=100,
        required=True,
        widget=forms.TextInput(attrs={
            'placeholder': 'Введите вашу фамилию',
            'class': 'form-control',
            'data-pattern': '^[А-ЯЁ][а-яё]{1,30}$',
            'data-pattern-error': 'Только буквы, первая заглавная',
            'data-required-error': 'Поле обязательно для заполнения',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
        }
    )

    email = forms.EmailField(
        label="Email",
        required=True,
        widget=forms.EmailInput(attrs={
            'placeholder': 'Введите ваш email',
            'class': 'form-control',
            'data-required-error': 'Поле обязательно для заполнения',
            'data-type-error': 'Пожалуйста, введите корректный email',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
            'invalid': 'Пожалуйста, введите корректный email',
        }
    )

    password1 = forms.CharField(
        label="Пароль",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Придумайте пароль',
            'class': 'form-control',
            'data-min-length': '8',
            'data-max-length': '30',
            'data-length-error': 'Пароль должен быть от 8 до 30 символов',
            'data-required-error': 'Поле обязательно для заполнения',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
        }
    )

    password2 = forms.CharField(
        label="Подтвердите пароль",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Повторите пароль',
            'class': 'form-control',
            'data-match': '#id_password1',
            'data-match-error': 'Пароли должны совпадать',
            'data-required-error': 'Поле обязательно для заполнения',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
        }
    )

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'password1', 'password2')

    def clean_first_name(self):
        first_name = self.cleaned_data.get('first_name')
        if not re.match(r'^[А-ЯЁ][а-яё]{1,30}$', first_name):
            raise ValidationError('Только буквы, первая заглавная')
        return first_name

    def clean_last_name(self):
        last_name = self.cleaned_data.get('last_name')
        if not re.match(r'^[А-ЯЁ][а-яё]{1,30}$', last_name):
            raise ValidationError('Только буквы, первая заглавная')
        return last_name

    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        if len(password1) < 8 or len(password1) > 30:
            raise ValidationError('Пароль должен быть от 8 до 30 символов')
        return password1

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            self.add_error('password2', "Пароли должны совпадать")

        return cleaned_data


class LoginForm(forms.Form):
    email = forms.EmailField(
        label="Email",
        required=True,
        widget=forms.EmailInput(attrs={
            'placeholder': 'Введите ваш email',
            'class': 'form-control',
            'data-required-error': 'Поле обязательно для заполнения',
            'data-type-error': 'Пожалуйста, введите корректный email',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
            'invalid': 'Пожалуйста, введите корректный email',
        }
    )

    password = forms.CharField(
        label="Пароль",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'placeholder': 'Введите пароль',
            'class': 'form-control',
            'data-required-error': 'Поле обязательно для заполнения',
        }),
        error_messages={
            'required': 'Поле обязательно для заполнения',
        }
    )


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['title', 'content', 'image']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Введите заголовок поста',
                'class': 'form-control',
                'required': 'required'
            }),
            'content': forms.Textarea(attrs={
                'placeholder': 'Напишите ваш пост здесь...',
                'class': 'form-control',
                'rows': 5,
                'required': 'required'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control-file',
                'accept': 'image/*'
            })
        }
        labels = {
            'title': 'Заголовок',
            'content': 'Содержимое',
            'image': 'Изображение'
        }
        error_messages = {
            'title': {
                'required': 'Поле обязательно для заполнения',
            },
            'content': {
                'required': 'Поле обязательно для заполнения',
            }
        }