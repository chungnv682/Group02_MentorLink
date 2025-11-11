#!/bin/sh

# Thông tin của tác giả (Author) cũ
OLD_EMAIL="trunkvtv123@gmail.com"
OLD_NAME="chienapc"

# Thông tin của tác giả (Author) mới
CORRECT_NAME="nguyenbahien123"
CORRECT_EMAIL="nguyenbahien170604@gmail.com"

# Sử dụng git filter-branch để thay đổi Author và Committer
git filter-branch --env-filter '
    # Nếu tác giả (Author) là chienapc, thay đổi thông tin Author
    if [ "$GIT_AUTHOR_EMAIL" = "trunkvtv123@gmail.com" ]
    then
        export GIT_AUTHOR_NAME="nguyenbahien123"
        export GIT_AUTHOR_EMAIL="nguyenbahien170604@gmail.com"
    fi

    # Nếu người ký (Committer) là chienapc, thay đổi thông tin Committer
    if [ "$GIT_COMMITTER_EMAIL" = "trunkvtv123@gmail.com" ]
    then
        export GIT_COMMITTER_NAME="nguyenbahien123"
        export GIT_COMMITTER_EMAIL="nguyenbahien170604@gmail.com"
    fi
' --tag-name-filter cat -- --branches --tags