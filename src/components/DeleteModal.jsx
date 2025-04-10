import supabase from "../supabase";
export default function DeleteModal({ closeModal, userTempData, getUser }) {
    const deleteUser = async (userTempData) => {
        try {

            const { error: deleteUserError } = await supabase
                .from('users')
                .delete()
                .eq('user_id', userTempData.user_id);

            if (deleteUserError) {
                console.log('user form delete failed')
                throw deleteUserError;
            }

            closeModal('delete');
            getUser();

            console.log(`成功刪除 users 表內 user_id: ${userTempData.user_id}`);



        } catch (error) {
            console.error('刪除用戶時發生錯誤：', error);
        }
    };



    return (<>
        <div className="modal fade" id="deleteStaffModal">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">刪除員工資料</h5>
                        <button type="button" className="btn-close" onClick={() => closeModal('delete')}></button>
                    </div>
                    <div className="modal-body">
                        確定要刪除{userTempData?.name}嗎
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => closeModal('delete')}>取消</button>
                        <button type="button" className="btn btn-primary" onClick={() => deleteUser(userTempData)}>確認刪除</button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}