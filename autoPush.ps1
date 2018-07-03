while (1){
    git add *
    git commit -m (Get-Date).ToString()
    git push
    Start-Sleep -s 10
}