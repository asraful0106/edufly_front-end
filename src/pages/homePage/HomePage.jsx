import React, { useContext, useRef, useState } from 'react';
import Navigation from '../../sharedComponent/navigation/Navigation';
import Footer from '../../sharedComponent/footer/Footer';
import { Outlet, useLocation } from 'react-router';
import EiiContext from '../../contextapi/eiiSearch/EiiSearchContext';
import Modal from '../../sharedComponent/Modal';
import PostModalContext from '../../contextapi/postModal/PostModalContext';
import { MdNoteAdd } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const HomePage = () => {
    const currentLocation = useLocation();
    const { data, loading, error, fetchData } = useContext(EiiContext);

    // For handeling when user load the page 
    if (!data) {
        const regex = /(?<=^\/)(\d+)(?=\/|$)/;
        const eiinValue = currentLocation.pathname?.match(regex)[0];
        fetchData(`${import.meta.env.VITE_BACKEND_LINK}/search/eiin/${eiinValue}`);
    }

    // For Post Modal
    const { postModal, setPostModal } = useContext(PostModalContext);

    const [postUplodLoding, setPostUplodLoading] = useState(false);
    const [titleInput, setTileInput] = useState("");
    const titileRef = useRef(null);
    const descriptionRef = useRef(null);

    const handelTitleInput = (e) => {
        setTileInput(e.target.value);
    }
    const [textInput, setTextInput] = useState("");
    // Auto-resize textarea as user types
    const handleInput = (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setTextInput(e.target.value);
    };

    // File upload states
    const [isFile, setIsfile] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);


    // Handle file selection from input
    const handleFileUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file =>
            file.type.startsWith("image/") || file.type.startsWith("video/")
        );

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            setIsfile(true);
        }
    };


    // Clear selected or dropped file
    const handleClearFiles = () => {
        setFiles([]);
        setIsfile(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };


    // Allow drag-over to enable drop zone
    const handleDragoverUplod = (e) => {
        e.preventDefault(); // Required to allow drop
    }

    // Handle file drop
    const handleDropUpload = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file =>
            file.type.startsWith("image/") || file.type.startsWith("video/")
        );

        if (validFiles.length > 0) {
            setFiles(prev => [...prev, ...validFiles]);
            setIsfile(true);
        }
    };

    // upload the post to the server
    const handlePostUpload = (e) => {
        e.preventDefault();
        setPostUplodLoading(true);
        if ((textInput || isFile) && titleInput) {
            const formData = new FormData();
            formData.append('institution_id', currentLocation.pathname?.match(/(?<=^\/)(\d+)(?=\/|$)/)[0]);
            formData.append('title', titleInput);
            formData.append('description', textInput);
            files.forEach((file) => {
                formData.append('fileInputField', file);
            });

            // make a post request with axios
            axios.post(`${import.meta.env.VITE_BACKEND_LINK}/post`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                // eslint-disable-next-line no-unused-vars
                .then(response => {
                    // console.log('Post uploaded successfully:', response.data);
                    setPostModal(false); // Close the modal after successful upload
                    setTileInput('');
                    setTextInput('');
                    setFiles([]);
                    setIsfile(false);
                    setPostUplodLoading(false);
                    titileRef.current.value = '';
                    descriptionRef.current.value = '';
                    fileInputRef.current.value = null;
                    
                    toast.success("Post Uploaded!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                })
                // eslint-disable-next-line no-unused-vars
                .catch(error => {
                    setPostUplodLoading(false);
                    // console.error('Error uploading post:', error);
                    toast.error("Some thing wrong unable to upload!", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                });
        }
    }


    return (
        <div className='flex flex-col min-h-screen bg-[#eeeeee]'>
            {/* For Sweet Aalert */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            {/* Modal Part */}
            <Modal open={postModal} onClose={() => setPostModal(false)}>
                <form>
                    <div className='h-[33rem] w-[35rem] overflow-y-auto'>
                        <h1 className='text-center text-2xl font-bold'>Create Post</h1>
                        <div className='mt-8'>
                            {/* Title Input Field */}
                            <input type="text" id='postTitle' name='postTitle' placeholder='Post Title*' className='w-full border-b focus:border-b focus:outline-none focus:ring-0 placeholder:text-xl placeholder:font-semibold mb-4 pb-2' onChange={handelTitleInput} ref={titileRef}/>
                            {/* Description Input Field */}
                            <textarea
                                name="postText"
                                id="postText"
                                placeholder="What's on your mind!"
                                className="w-full resize-none overflow-hidden placeholder:text-2xl placeholder:font-bold focus:border-none focus:outline-none focus:ring-0 py-2"
                                onInput={handleInput}
                                rows={1}
                                ref={descriptionRef}
                            />

                            {/* Image Input */}
                            <div className='w-full h-[20rem] mt-10 p-2 border rounded-lg relative'>

                                {/* Button for clear image or video selections */}
                                {
                                    isFile &&
                                    <div
                                        onClick={handleClearFiles}
                                        className='p-3 rounded-full z-10 bg-black/35 text-black/75 absolute right-4 top-4 hover:bg-black/50 hover:text-black'
                                    >
                                        <RxCross2 className='text-xl' />
                                    </div>
                                }

                                {/* Add photo button when file is already selected */}
                                {
                                    isFile &&
                                    <button className='py-2 px-8 bg-white shadow-2xs rounded-lg text-black font-semibold absolute left-4 top-4' onClick={() => fileInputRef.current?.click()}>
                                        Add photos/videos
                                    </button>
                                }

                                {/* File drop area */}
                                {
                                    !isFile &&
                                    <div
                                        className="w-full h-full rounded-lg bg-black/5 hover:bg-black/20 flex items-center justify-center cursor-pointer"
                                        onDragOver={handleDragoverUplod}  // Fix: Correct dragOver event
                                        onDrop={handleDropUpload}
                                        onClick={() => fileInputRef.current?.click()}  // Allow click to open file dialog
                                    >
                                        <div className='flex flex-col items-center justify-center'>
                                            <MdNoteAdd className='bg-black/5 text-5xl p-2 rounded-full' />
                                            <h1 className='text-xl font-bold'>Add photos/videos</h1>
                                            <p>or drag and drop</p>
                                        </div>
                                    </div>
                                }

                                {/* Hidden input (kept outside the drop zone) */}
                                <input
                                    id='fileInputField'
                                    name='fileInputField'
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    multiple
                                    accept="image/*,video/*" // restricts file types
                                    ref={fileInputRef}
                                />

                                {/* Preview  the image*/}
                                {isFile && (
                                    <div className="mt-4">
                                        {files.length === 1 && (
                                            <div className="w-full h-64 overflow-hidden rounded-lg">
                                                {files[0].type.startsWith("image/") && (
                                                    <img src={URL.createObjectURL(files[0])} alt="preview" className="w-full h-full object-cover" />
                                                )}
                                                {files[0].type.startsWith("video/") && (
                                                    <video controls className="w-full h-full object-cover">
                                                        <source src={URL.createObjectURL(files[0])} />
                                                    </video>
                                                )}
                                            </div>
                                        )}

                                        {files.length === 2 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {files.map((file, index) => (
                                                    <div key={index} className="h-48 overflow-hidden rounded-md">
                                                        {file.type.startsWith("image/") && (
                                                            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                        )}
                                                        {file.type.startsWith("video/") && (
                                                            <video controls className="w-full h-full object-cover">
                                                                <source src={URL.createObjectURL(file)} />
                                                            </video>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {files.length === 3 && (
                                            <div className="grid grid-cols-3 gap-2 h-64">
                                                {/* Left full-height image */}
                                                <div className="col-span-2 overflow-hidden rounded-md">
                                                    {files[0].type.startsWith("image/") && (
                                                        <img src={URL.createObjectURL(files[0])} alt="preview" className="w-full h-full object-cover" />
                                                    )}
                                                    {files[0].type.startsWith("video/") && (
                                                        <video controls className="w-full h-full object-cover">
                                                            <source src={URL.createObjectURL(files[0])} />
                                                        </video>
                                                    )}
                                                </div>

                                                {/* Right side - two stacked items */}
                                                <div className="flex flex-col gap-2">
                                                    {[files[1], files[2]].map((file, index) => (
                                                        <div key={index} className="h-1/2 overflow-hidden rounded-md">
                                                            {file.type.startsWith("image/") && (
                                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                            )}
                                                            {file.type.startsWith("video/") && (
                                                                <video controls className="w-full h-full object-cover">
                                                                    <source src={URL.createObjectURL(file)} />
                                                                </video>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {files.length >= 4 && (
                                            <div className="grid grid-cols-3 gap-2 h-64">
                                                {/* Left full-height image */}
                                                <div className="col-span-2 overflow-hidden rounded-md">
                                                    {files[0].type.startsWith("image/") && (
                                                        <img src={URL.createObjectURL(files[0])} alt="preview" className="w-full h-full object-cover" />
                                                    )}
                                                    {files[0].type.startsWith("video/") && (
                                                        <video controls className="w-full h-full object-cover">
                                                            <source src={URL.createObjectURL(files[0])} />
                                                        </video>
                                                    )}
                                                </div>

                                                {/* Right side - three stacked items */}
                                                <div className="flex flex-col gap-2">
                                                    {[files[1], files[2], files[3]].map((file, index) => (
                                                        <div key={index} className="relative h-1/3 overflow-hidden rounded-md">
                                                            {file.type.startsWith("image/") && (
                                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                            )}
                                                            {file.type.startsWith("video/") && (
                                                                <video controls className="w-full h-full object-cover">
                                                                    <source src={URL.createObjectURL(file)} />
                                                                </video>
                                                            )}

                                                            {/* Show "+X more" on the third item if there are extra files */}
                                                            {index === 2 && files.length > 4 && (
                                                                <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-lg font-bold">
                                                                    +{files.length - 4} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Post button */}
                    <button onClick={handlePostUpload} className={`py-3 w-full rounded-lg mt-2 text-xl font-bold ${textInput.trim() || files.length > 0 ? "bg-[#1A77F2] text-white" : "bg-black/15"}`}>{postUplodLoding ? <span className="loading loading-spinner loading-xs"></span> : "Post"}</button>
                </form>
            </Modal>
            {/* ------------***-------------- */}

            {/* Navigation */}
            <Navigation location="/home" />

            {/* Page Content */}
            <main className='flex-grow max-w-screen'>
                <Outlet />
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;
