!macro customUnInit
  ; 创建卸载选项页面
  !insertmacro MUI_UNPAGE_WELCOME
  !insertmacro MUI_UNPAGE_CONFIRM
  
  ; 创建自定义卸载选项页面
  !define MUI_PAGE_CUSTOMFUNCTION_PRE un.UninstConfirmPre
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW un.UninstConfirmShow
  !define MUI_PAGE_CUSTOMFUNCTION_LEAVE un.UninstConfirmLeave
  !insertmacro MUI_UNPAGE_COMPONENTS
  
  ; 创建卸载进度页面
  !insertmacro MUI_UNPAGE_INSTFILES
  
  ; 创建卸载完成页面
  !insertmacro MUI_UNPAGE_FINISH

  ; 卸载选项页面函数
  Function un.UninstConfirmPre
    !insertmacro MUI_HEADER_TEXT "卸载选项" "选择卸载选项"
  FunctionEnd

  Function un.UninstConfirmShow
    ${NSD_CreateCheckbox} 0 40u 100% 12u "删除所有数据（包括待办事项、重复事件和设置）"
    Pop $R0
    ${NSD_SetState} $R0 0
  FunctionEnd

  Function un.UninstConfirmLeave
    ${NSD_GetState} $R0 $R1
    ${If} $R1 == 1
      ; 用户选择删除数据
      MessageBox MB_YESNO|MB_ICONQUESTION "确定要删除所有数据吗？$\n$\n此操作不可恢复。" IDNO skipDeleteData
      
      ; 删除 IndexedDB 数据库
      RMDir /r "$APPDATA\${PRODUCT_NAME}\IndexedDB"
      
      ; 删除其他应用数据
      RMDir /r "$APPDATA\${PRODUCT_NAME}"
      
      skipDeleteData:
    ${EndIf}
  FunctionEnd
!macroend 