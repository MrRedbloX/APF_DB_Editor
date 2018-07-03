cd ..
while (1){
    git add * > $void
    git commit -m (Get-Date).ToString() > $void
    git push > $void
    Start-Sleep -s 5
}
