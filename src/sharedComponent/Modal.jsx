import React from 'react';
import { RxCross2 } from "react-icons/rx";

const Modal = ({open, onClose, children}) => {
    return (
        <div onClick={onClose} className={`w-[100dvw] h-[100dvh] fixed flex justify-center items-center z-10 transition-colors ${open ? "visible bg-black/20" : "invisible"}`}>
            {/* Modal */}
            <div onClick={(e) => e.stopPropagation()} className={`bg-white rounded-xl shadow p-4 transition-all ${open ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}>
                <div onClick={onClose} className='p-4 rounded-full bg-black/20 absolute right-2 top-2 hover:bg-[#1A77F2]/50 hover:text-white'>
                    <RxCross2 className='text-xl'/>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;