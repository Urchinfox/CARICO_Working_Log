// export default function PunchModal({ closePunchModal, handlePunch, modalType, punchInOutModalRef }) {
//     return (<>
//         <div className="modal fade" ref={punchInOutModalRef}>
//             <div className="modal-dialog">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title">{modalType === 'punchin' ? '上班打卡' : '下班打卡'}</h5>
//                         <button type="button" className="btn-close" onClick={closePunchModal}></button>
//                     </div>
//                     <div className="modal-body">
//                         <p>2025 / 4 / 29 - 8:50</p>
//                     </div>
//                     <div className="modal-footer">
//                         <button type="button" className="btn btn-secondary" onClick={closePunchModal}>取消</button>
//                         <button type="button" className="btn btn-primary" onClick={() => handlePunch(modalType === 'punchin' ? 'in' : 'out')}>確定打卡</button>
//                     </div>
//                 </div>
//             </div>
//         </div>

//     </>)
// }

// import PropTypes from 'prop-types';

export default function PunchModal({ closePunchModal, handlePunch, modalType, punchInOutModalRef, punchTime }) {
    const formatPunchTime = (time) => {
        if (!time) return '載入中...';
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} - ${hours}:${minutes}`;
    };

    return (
        <div className="modal fade" ref={punchInOutModalRef}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{modalType === 'punchin' ? '上班打卡' : '下班打卡'}</h5>
                        <button type="button" className="btn-close" onClick={closePunchModal}></button>
                    </div>
                    <div className="modal-body">
                        <p>{formatPunchTime(punchTime)}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closePunchModal}>取消</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handlePunch(modalType === 'punchin' ? 'in' : 'out')}
                        >
                            確定打卡
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// PunchModal.propTypes = {
//     closePunchModal: PropTypes.func.isRequired,
//     handlePunch: PropTypes.func.isRequired,
//     modalType: PropTypes.oneOf(['punchin', 'punchout']).isRequired,
//     punchInOutModalRef: PropTypes.object.isRequired,
//     punchTime: PropTypes.instanceOf(Date),
// };