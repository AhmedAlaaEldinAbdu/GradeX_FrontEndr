const SCHOOLS = '/schools'

export const SchoolsEndpoints = {
    addSchool: SCHOOLS,
    getSchools: SCHOOLS,
    editSchool: (id: string) => `${SCHOOLS}/${id}`,
    getSchoolById: (id: string) => `${SCHOOLS}/${id}`,
    editSchoolStatus: (id: string) => `${SCHOOLS}/${id}/status`,
    addSchoolRequest: (id: string) => `${SCHOOLS}/${id}/update-request`,
    getLocationFilters: `${SCHOOLS}/location/filters`,
};


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ResponseModel } from "../../models/responseModel";
import { RequestStatus } from "../../enums/enums";
import Blog, { BlogResponse } from "../../models/blog";
import { KnowledgeAggConsume } from "@4eplatform/shared/apis/knowledge_agg";
import { BlogConsume } from "@4eplatform/shared/apis/blog";
interface BlogState {
  data: BlogResponse;
  status: RequestStatus;
  error: string | null;
}

const initialState: BlogState = {
  data: new BlogResponse(),
  status: RequestStatus.idle,
  error: "",
};

export const fetchBlogs = createAsyncThunk<ResponseModel, any>(
  "blogs/fetchBlogs",
  async (params = {}, thunkApi) => {
    try {
      const response = await KnowledgeAggConsume.getBlogs(params);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const likeDislikeBlog = createAsyncThunk<ResponseModel, any>(
  "blogs/likeDislikeBlog",
  async (likeState, thunkApi) => {
    try {
      const response = await BlogConsume.likeBlog(likeState);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const fetchBlog = createAsyncThunk<ResponseModel, string>(
  "blogs/fetchBlog",
  async (blogId: string, thunkApi) => {
    try {
      const response = await KnowledgeAggConsume.getRequestedBlogByIdForDetails(blogId);
      return response;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const addBlog = createAsyncThunk<ResponseModel, any>(
  "blogs/addBlog",
  async (newBlog, thunkApi) => {
    try {
      const response = await BlogConsume.addBlog(newBlog);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const editBlog = createAsyncThunk(
  "blogs/editBlog",
  async ({ blog, id }: { blog: object; id: string }, thunkApi) => {
    try {
      const response = await BlogConsume.editBlog({
        body: blog,
        id: id,
      });
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const removeBlog = createAsyncThunk<ResponseModel, any>(
  "blogs/removeBlog",
  async (blogId, thunkApi) => {
    try {
      const res = await BlogConsume.deleteBlog(blogId);
      return res;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = RequestStatus.succeeded;
        state.data.blogs = action.payload?.result as Blog[];
        state.data.pageIndex = action.payload?.pageIndex;
        state.data.pageSize = action.payload?.pageSize;
        state.data.totalItems = action.payload?.totalItems;
        state.data.pageIndex = action.payload?.pageIndex;
      })
      .addCase(fetchBlog.fulfilled, (state, action) => {
        state.status = RequestStatus.succeeded;
        state.data.blog = action.payload?.result as Blog;
      })
      .addCase(removeBlog.fulfilled, (state, action) => {
        state.status = RequestStatus.succeeded;
        state.data.blogs = state.data.blogs?.filter(
          (blog) => +blog.id !== +action.payload
        );
      })
      .addCase(addBlog.pending, handlePending)
      .addCase(addBlog.fulfilled, handleFulfilled)
      .addCase(addBlog.rejected, handleRejected)
      .addCase(editBlog.pending, handlePending)
      .addCase(editBlog.fulfilled, handleFulfilled)
      .addCase(editBlog.rejected, handleRejected)
      .addCase(fetchBlogs.pending, handlePending)
      .addCase(fetchBlogs.rejected, handleRejected)
      .addCase(fetchBlog.rejected, handleRejected)
      .addCase(fetchBlog.pending, handlePending)
      .addCase(removeBlog.rejected, handleRejected)
      .addCase(removeBlog.pending, handlePending);
  },
});

const handlePending = (state: BlogState) => {
  state.status = RequestStatus.loading;
};
const handleFulfilled = (state: BlogState) => {
  state.status = RequestStatus.succeeded;
};

const handleRejected = (state: BlogState, action: any) => {
  state.status = RequestStatus.failed;
  state.error = action.error.message ?? "An error occurred";
};

export default blogSlice.reducer;
