<template>
  <div class="app-container">
    <el-form :inline="true" :model="query" size="mini">
      <el-form-item label="广告标题: ">
        <el-input v-model.trim="query.title" />
      </el-form-item>
      <el-form-item label="状态: ">
        <el-select v-model="query.status" clearable filterable style="width:85px">
          <el-option v-for="item in statusOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="reloadData">重置</el-button>
        <el-button icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="list"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column align="center" type="index" label="序号" width="50" />
      <el-table-column align="center" prop="title" label="广告标题" />
      <el-table-column align="center" prop="imageUrl" label="广告图片">
        <template slot-scope="scope">
          <el-image
            style="width: 100px; height: 100px"
            :src="scope.row.imageUrl"
            :preview-src-list="[scope.row.imageUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" prop="advertUrl" label="广告链接" />
      <el-table-column align="center" prop="status" label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status ? '正常': '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="sort" label="排序" />
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="info" size="mini" @click="handlerEdit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handlerDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="page.current"
      :page-sizes="[10, 20, 50]"
      :page-size="page.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <edit :title="edit.title" :visible="edit.visible" :form-data="edit.formData" :remote-close="remoteClose" :old-image-url="edit.oldImageUrl" />
  </div>
</template>

<script>
import api from '@/api/advert'
import Edit from './edit'

const statusOptions = [
  { code: 0, name: '禁用' },
  { code: 1, name: '正常' }
]

export default {
  name: 'Advert', // 路由配置 meta.name  与 视图组件中的 name 值一致, 不然缓存可能会失效。(切记 name 命名时候尽量保证唯一性 切记不要和某些组件的命名重复了,不然会递归引用最后内存溢出等问题
  filters: {
    statusFilter(status) {
      // 0 禁用，1 正常
      const statusMap = { 0: 'danger', 1: 'success' }
      return statusMap[status]
    }
  },
  components: { Edit },
  data() {
    return {
      list: [],
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      query: {}, // 查询条件
      statusOptions, // 状态下拉框数组
      edit: {
        title: '新增',
        visible: false,
        formData: {
          imageUrl: null // 不声明，上传后无法回显展示图片
        },
        oldImageUrl: null // 编辑时，查询出来的原始图片
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const { data } = await api.getList(this.query, this.page.current, this.page.size)
      this.page.total = data.total
      this.list = data.records
    },
    async handlerEdit(id) {
      const response = await api.getById(id)
      if (response.code === 20000) {
        this.edit.formData = response.data
        this.edit.oldImageUrl = response.data.imageUrl // 保存修改之前的图片url
        this.edit.visible = true
        this.edit.title = '编辑'
      }
    },
    handlerDelete(id) {
      this.$confirm('确认删除这条记录吗? ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const response = await api.deleteById(id) // 发送删除请求
        this.$message({ // 处理相应结果提示
          type: response.code === 20000 ? 'success' : 'error',
          message: response.message
        })
        this.fetchData() // 刷新列表数据
      }).catch(() => {})
    },
    // val 是切换之后每页显示多少条数据
    handleSizeChange(val) {
      this.page.size = val
      this.fetchData()
    },
    // 当页码改变后触发此方法，val 是当前点击或输入的页码
    handleCurrentChange(val) {
      this.page.current = val
      this.fetchData()
    },
    // 条件查询
    queryData() {
      // 将页码变为1，第1页
      this.page.current = 1
      this.fetchData()
    },
    // 重置条件查询
    reloadData() {
      this.query = {}
      this.fetchData()
    },
    // 子组件会触发此事件方法来关闭窗口
    remoteClose() {
      this.edit.formData = { imageUrl: null }
      this.edit.visible = false
      this.fetchData()
    },
    // 打开窗口，新增数据
    openAdd() {
      this.edit.visible = true
      this.edit.title = '新增'
    }
  }
}
</script>

<style scoped>
</style>
