!macro customUnInit
  MessageBox MB_YESNO|MB_ICONQUESTION "是否要删除所有数据？$\n$\n选择"是"将删除所有待办事项、重复事件和设置。此操作不可恢复。" IDNO skipDeleteData
  
  ; 删除 IndexedDB 数据库
  RMDir /r "$APPDATA\${PRODUCT_NAME}\IndexedDB"
  
  ; 删除其他应用数据
  RMDir /r "$APPDATA\${PRODUCT_NAME}"
  
  skipDeleteData:
!macroend 