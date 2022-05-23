const patterns = {
	phone:{ mask:"+# (###) ###-####", allow:/[0-9]/g },
	card: { mask:"#### #### #### ####", allow:/[0-9]/g },
	date: { mask:"####-##-## ##:##", allow:/[0-9]/g }
};

export default patterns;