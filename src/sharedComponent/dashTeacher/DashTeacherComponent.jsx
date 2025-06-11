import React, { useState, useRef } from 'react';
import { IoCreateOutline } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";

const DashTeacherComponent = () => {
    const [searchType, setSearchType] = useState("ID");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);


    // Form fileds
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [teacherEmail, setTeacherEmail] = useState("");
    const [teacherPhone, setTeacherPhone] = useState("");
    const inputFileRef = useRef(null);

    const handleDropdownToggle = (e) => {
        e.preventDefault();
        setDropdownOpen((prev) => !prev);
    };

    const handleDropdownSelect = (type) => {
        setSearchType(type);
        setDropdownOpen(false);
        inputRef.current?.focus();
    };

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement your search logic here
        alert(`Searching by ${searchType}: ${searchValue}`);
    };


    // For handeling the creating
    const handleCreate = () => {
        setIsCreating(true);
    }

    // Form handeling logic
    const handleFileUplod = () => {
        const file = inputFileRef.current?.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    }

    const handleFromSubmission = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <div className='flex items-center justify-center'>
                <div>
                    {/* Search and new teacher entry section */}
                    {
                        !isCreating &&
                        <div className='w-full bg-gray-800 rounded-xl py-8 px-8 mt-10 mx-16 flex items-center justify-between'>
                            {/* search box */}
                            <form onSubmit={handleSearch}>
                                <div className="w-full max-w-sm min-w-[200px] bg-white rounded">
                                    <div className="relative mt-2">
                                        <div className="absolute top-1 left-1 flex items-center z-20">
                                            <button
                                                id="dropdownButton"
                                                type="button"
                                                onClick={handleDropdownToggle}
                                                className="rounded border border-transparent py-1 px-1.5 text-center flex items-center text-sm transition-all text-slate-600"
                                            >
                                                <span id="dropdownSpan" className="text-ellipsis overflow-hidden">
                                                    {searchType}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    className="h-4 w-4 ml-1"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                                                    />
                                                </svg>
                                            </button>
                                            <div className="h-6 border-l border-slate-200 ml-1" />
                                            <div
                                                id="dropdownMenu"
                                                className={`min-w-[150px] absolute left-0 mt-10 bg-white border border-slate-200 rounded-md shadow-lg z-30 ${dropdownOpen ? "" : "hidden"}`}
                                            >
                                                <ul id="dropdownOptions">
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("ID")}
                                                    >
                                                        ID
                                                    </li>
                                                    <li
                                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                                                        onClick={() => handleDropdownSelect("Name")}
                                                    >
                                                        Name
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={searchValue}
                                            onChange={handleInputChange}
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pr-12 pl-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                                            placeholder={searchType === "ID" ? "Enter teacher ID..." : "Enter teacher name..."}
                                        />
                                        <button
                                            className="absolute right-1 top-1 rounded bg-slate-800 p-1.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                            type="submit"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 16 16"
                                                fill="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </form>
                            {/* Create new Teacher button */}
                            <div>
                                <button
                                    onClick={handleCreate}
                                    className={`flex items-center mt-1 p-2 rounded-lg text-black group bg-white`}
                                >
                                    <IoCreateOutline className={`w-5 h-5 transition duration-75`} />
                                    <span className="flex-1 ms-3 whitespace-nowrap">Create</span>
                                </button>
                            </div>
                        </div>
                    }
                </div>
            </div>
            {/* From for creating new teacher */}
            {isCreating &&
                <div className='p-10 m-10 bg-white rounded-2xl shadow-2xl'>
                    <h6 className='font-bold mb-4'>Profile Photo</h6>
                    <form
                        onSubmit={handleFromSubmission}
                    >
                        <div>
                            <div className='flex items-center gap-6 mt-6'>
                                <div className="avatar">
                                    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                                        <img
                                            src={previewImage || "/public/no_image.png"}
                                            alt="Profile Preview"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs mt-2 text-gray-400">JPG, GIF or PNG. Maximum File Size 5MB</p>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/gif"
                                        className="hidden"
                                        onChange={handleFileUplod}
                                        ref={inputFileRef}

                                    />
                                    <button
                                        onClick={() => inputFileRef.current?.click()}
                                        className="mt-4 text-sm text-gray-500 py-2 px-4
                                                rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                    >
                                        Change Photo
                                    </button>
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-x-10 gap-y-2 mt-10'>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Name (English)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherName}
                                        onChange={e => setTeacherName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Name (Bangla)</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherName}
                                        onChange={e => setTeacherName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Teacher ID</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherEmail}
                                        onChange={e => setTeacherEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Teacher Initial</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherEmail}
                                        onChange={e => setTeacherEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherEmail}
                                        onChange={e => setTeacherEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherPhone}
                                        onChange={e => setTeacherPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block mb-1 font-medium">Parmanent Address</label>
                                    <input
                                        type="tel"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherPhone}
                                        onChange={e => setTeacherPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className='flex items-center justify-between'>
                                        <label className="block mb-1 font-medium">Present Adress</label>
                                        <div>
                                            <input type="checkbox" name='paramnenetCheck' id='paramnenetCheck' />
                                            <label className='ml-1' htmlFor="paramnenetCheck">Same as Parmanent Address</label>
                                        </div>
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                        value={teacherPhone}
                                        onChange={e => setTeacherPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4 flex items-center gap-x-6">
                                    {/* Position */}
                                    <div>
                                        <label className="block mb-1 font-medium">Position</label>
                                        <input
                                            type="tel"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            value={teacherPhone}
                                            onChange={e => setTeacherPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block mb-1 font-medium">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4 flex items-center gap-4">
                                    {/* Signeture */}
                                    <div>
                                        <label className="block mb-1 font-medium">Signature</label>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept='image/png, image/jpeg, image/jpg'
                                            onChange={e => setTeacherPhone(e.target.value)}
                                            required
                                        />
                                        <div className='flex items-center gap-x-4'>
                                            <div className='h-10 w-[10rem] rounded'>
                                                <img className='w-full h-full' src="" alt="" />
                                            </div>
                                            <button
                                                onClick={() => inputFileRef.current?.click()}
                                                className="text-sm text-gray-500 py-4 px-4
                                                rounded bg-gray-200/80 hover:bg-gray-300 cursor-pointer"
                                            >
                                                <LuUpload />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Blood Group */}

                                    <div>
                                        <label htmlFor="bloodGroup" className="block mb-1 font-medium">Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            id="bloodGroup"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                            required
                                        >
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label htmlFor="gender" className="block mb-1 font-medium">Gender</label>
                                        <select
                                            name="gender"
                                            id="gender"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                            required
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Relegion */}
                                    <div>
                                        <label htmlFor="religion" className="block mb-1 font-medium">Releigion</label>
                                        <select
                                            name="religion"
                                            id="religion"
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
                                            required
                                        >
                                            <option value="islam">Islam</option>
                                            <option value="christianity">Christianity</option>
                                            <option value="hinduism">Hinduism</option>
                                            <option value="buddhism">Buddhism</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </div>

                    </form>
                </div>
            }
        </div>
    );
};

export default DashTeacherComponent;