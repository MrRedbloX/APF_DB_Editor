while (1){
    git add *
    git commit -m (Get-Date).ToString()
    git push origin master
    Start-Sleep -s 10
}