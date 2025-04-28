import React from 'react';
import {
    Box,
    Button,
    TextField
} from '@mui/material';
import './userDetail.css';
import axios from 'axios';

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: undefined,
            selectedFile: null
        };
    }
    componentDidMount() {
        const new_user_id = this.props.match.params.userId;
        this.handleUserChange(new_user_id);
    }

    componentDidUpdate() {
        const new_user_id = this.props.match.params.userId;
        const current_user_id = this.state.user?._id;
        if (current_user_id  !== new_user_id){
            this.handleUserChange(new_user_id);
        }
    }

    handleUserChange(user_id) {
        axios.get("/user/" + user_id)
          .then((response) => {
              const new_user = response.data;
              this.setState({
                  user: new_user
              });
              const main_content = "User Details for " + new_user.first_name + " " + new_user.last_name;
              this.props.changeMainContent(main_content);
          });
    }

    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };
    
    handleUpload = (event) => {
        event.preventDefault();
        const { selectedFile } = this.state;
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }
        const formData = new FormData();
        formData.append('uploadedphoto', selectedFile);
    
        axios.post('/profilePic', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            alert('Profile picture uploaded successfully!');
            this.handleUserChange(this.state.user._id);  // reload user's data
            this.setState({ selectedFile: null });       // clear file input

        })
        .catch((error) => {
            console.error('Error uploading profile picture:', error);
            alert('Upload failed.');
        });
    };
    

    render() {
        console.log('RENDERING USERDETAIL');
        console.log('Logged-in user ID:', this.props.loggedInUserId);
        console.log('Profile user ID:', this.state.user ? this.state.user._id : 'no user loaded');
        return this.state.user ? (
            <div>
                <Box noValidate autoComplete="off">
                <div style={{ marginBottom: "20px" }}>
                    <img
                        src={"/images/" + (this.state.user.profilePic || "default_profile.jpg")}
                        alt="Profile"
                        style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    </div>
                    <div>
                        <Button variant="contained" component="a" href={"#/photos/" + this.state.user._id}>
                            User Photos
                        </Button>
                    </div>
                    <div>
                        <TextField id="first_name" label="First Name" variant="outlined" disabled fullWidth
                                   margin="normal"
                                   value={this.state.user.first_name}/>
                    </div>
                    <div>
                        <TextField id="last_name" label="Last Name" variant="outlined" disabled fullWidth
                                   margin="normal"
                                   value={this.state.user.last_name}/>
                    </div>
                    <div>
                        <TextField id="location" label="Location" variant="outlined" disabled fullWidth
                                   margin="normal"
                                   value={this.state.user.location}/>
                    </div>
                    <div>
                        <TextField id="description" label="Description" variant="outlined" multiline rows={4}
                                   disabled
                                   fullWidth margin="normal" value={this.state.user.description}/>
                    </div>
                    <div>
                        <TextField id="occupation" label="Occupation" variant="outlined" disabled fullWidth
                                   margin="normal"
                                   value={this.state.user.occupation}/>
                    </div>
    
                    {/* Only show upload section if viewing own profile */}
                    {this.props.loggedInUserId === this.state.user._id && (
                        <div style={{ marginTop: "20px" }}>
                        <h3>Upload / Change Profile Picture</h3>

                        {/* File input */}
                        <input type="file" accept="image/*" onChange={this.handleFileChange} />

                        {/* Live preview if file selected */}
                        {this.state.selectedFile && (
                        <div style={{ marginTop: "10px" }}>
                            <img
                            src={URL.createObjectURL(this.state.selectedFile)}
                            alt="Selected Profile"
                            style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
                            />
                        </div>
                        )}

                        {/* Upload button */}
                        <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleUpload}
                        style={{ marginLeft: "10px", marginTop: "10px" }}
                        >
                        Upload
                        </Button>
                    </div>
                    )}

    
                </Box>
            </div>
        ) : (
            <div/>
        );
    }    
}

export default UserDetail;