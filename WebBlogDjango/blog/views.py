from django.contrib.auth import login, authenticate, logout
from .forms import CustomUserCreationForm, LoginForm
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .forms import PostForm
from .models import Post
from django.conf import settings
import requests
from datetime import datetime
from django.views.decorators.http import require_POST
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_notification_to_bot(message):
    try:
        response = requests.post(
            f"{settings.TELEGRAM_BOT_SERVICE_URL}/send-notification",
            json={"message": message}
        )
        response.raise_for_status()
        print("✅ Уведомление отправлено в Telegram Bot Service")
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка отправки в Telegram Bot Service: {e}")


def index(request):
    posts = Post.objects.all().order_by('-date_create')
    for post in posts:
        post.user_liked = request.user in post.likes.all()
        post.user_disliked = request.user in post.dislikes.all()
    return render(request, 'blog/index.html', {'posts': posts})


def about(request):
    return render(request, 'blog/about.html')


@login_required
def create_blog(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            post = form.save(commit=False)
            post.user = request.user
            post.save()
            print(f"Пост создан: {post.title}")  # Для отладки
            return redirect('index')
        else:
            print("Ошибки формы:", form.errors)  # Для отладки
    else:
        form = PostForm()

    return render(request, 'blog/create_blog.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                message = (f"🔔 Пользователь вошел в систему:\n"
                           f"👤 Имя: {user.first_name}\n"
                           f"📝 Фамилия: {user.last_name}\n"
                           f"📧 Email: {user.email}\n"
                           f"🕒 Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                send_notification_to_bot(message)
                return JsonResponse({'redirect_url': reverse('index')})  # Добавлено
            else:
                form.add_error('password', 'Неверный email или пароль')

        errors = {field: errors[0] for field, errors in form.errors.items()}
        return JsonResponse({'errors': errors}, status=400)
    else:
        form = LoginForm()
    return render(request, 'blog/login.html', {'form': form})

def register_view(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            message = (f"🎉 Новый пользователь зарегистрирован:\n"
                       f"👤 Имя: {user.first_name}\n"
                       f"📝 Фамилия: {user.last_name}\n"
                       f"📧 Email: {user.email}\n"
                       f"🕒 Время: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            send_notification_to_bot(message)
            return JsonResponse({'redirect_url': reverse('index')})  # Добавлено
        errors = {field: errors[0] for field, errors in form.errors.items()}
        return JsonResponse({'errors': errors}, status=400)
    else:
        form = CustomUserCreationForm()
    return render(request, 'blog/register.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('index')


@login_required
def profile_view(request):
    user_posts = Post.objects.filter(user=request.user).order_by('-date_create')
    return render(request, 'blog/profile.html', {
        'user': request.user,
        'posts': user_posts
    })


def post_detail(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    post.user_liked = request.user in post.likes.all()
    post.user_disliked = request.user in post.dislikes.all()
    return render(request, 'blog/post_detail.html', {'post': post})


@login_required
@require_POST
def rate_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    action = request.POST.get('action')

    if action == 'like':
        if request.user in post.dislikes.all():
            post.dislikes.remove(request.user)
        post.likes.add(request.user)
    elif action == 'dislike':
        if request.user in post.likes.all():
            post.likes.remove(request.user)
        post.dislikes.add(request.user)
    elif action == 'unlike':
        post.likes.remove(request.user)
    elif action == 'undislike':
        post.dislikes.remove(request.user)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid action'}, status=400)

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'post_{post_id}',
        {
            'type': 'post_update',
            'likes_count': post.total_likes(),
            'dislikes_count': post.total_dislikes(),
            'user_liked': request.user in post.likes.all(),
            'user_disliked': request.user in post.dislikes.all(),
        }
    )

    return JsonResponse({
        'status': 'success',
        'likes_count': post.total_likes(),
        'dislikes_count': post.total_dislikes(),
        'user_liked': request.user in post.likes.all(),
        'user_disliked': request.user in post.dislikes.all()
    })


def get_post_rating(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    return JsonResponse({
        'status': 'success',
        'likes_count': post.total_likes(),
        'dislikes_count': post.total_dislikes(),
        'user_liked': request.user in post.likes.all(),
        'user_disliked': request.user in post.dislikes.all()
    })